'use client'

import PromptConfigBox from '@/components/PromptConfigBox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { ListAwsServicesResponse } from '@/features/aws/services/libs/types'
import { useCallback, useMemo, useState } from 'react'
import ReactFlow, {
  Background,
  Connection,
  Controls,
  Edge,
  MarkerType,
  MiniMap,
  Node,
  ReactFlowInstance,
  addEdge,
  useEdgesState,
  useNodesState,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { toast } from 'sonner'

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

export default function InfrastructureSetup({ data }: { data: ListAwsServicesResponse }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  const [searchValue, setSearchValue] = useState('')

  const filteredServices = useMemo(() => {
    if (!searchValue) return data.services
    return data.services.filter((svc) =>
      svc.displayName.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [data.services, searchValue])

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      const { source, target } = params
      if (!source || !target) return

      const sourceNode = nodes.find((n) => n.id === source)
      const targetNode = nodes.find((n) => n.id === target)

      // If node is not found or there is no connections configuration, do not allow connection
      if (
        !sourceNode ||
        !sourceNode.data?.service?.connections ||
        !Array.isArray(sourceNode.data.service.connections)
      ) {
        toast.error('These services cannot be connected.')
        return
      }

      // If connections does not include target node's service id, do not allow connection
      if (!sourceNode.data.service.connections.includes(targetNode?.data?.service?.id)) {
        toast.error('These services cannot be connected.')
        return
      }

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            markerEnd: { type: MarkerType.ArrowClosed, width: 24, height: 24 },
          },
          eds
        )
      )
    },
    [setEdges]
  )

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      if (!reactFlowInstance) return

      const type = event.dataTransfer.getData('application/reactflow')
      if (!type) return
      const service = data.services.find((s) => s.id === type)
      if (!service) return

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode: Node = {
        id: `${+new Date()}`,
        type: 'default',
        position,
        data: {
          label: service.displayName,
          service,
        },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [reactFlowInstance, setNodes]
  )

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  const handleNodeClick = (_: any, node: Node) => {
    setSelectedNode(node)
  }

  const handleConfigChange = (key: string, value: string | boolean) => {
    const { properties } = selectedNode?.data.service
    const updatedNodes = [...nodes]
    const nodeIndex = updatedNodes.findIndex((n) => n.id === selectedNode?.id)
    if (nodeIndex === -1) return
    updatedNodes[nodeIndex] = {
      ...updatedNodes[nodeIndex],
      data: {
        ...updatedNodes[nodeIndex].data,
        service: {
          ...updatedNodes[nodeIndex].data.service,
          properties: {
            ...properties,
            [key]: {
              ...properties[key],
              value,
            },
          },
        },
      },
    }
    setNodes(updatedNodes)
    setSelectedNode(updatedNodes[nodeIndex])
  }

  const exportConfig = () => {
    const payload = { nodes, edges }
    console.log('Send to BE:', payload)
    // fetch("/api/deploy", { method: "POST", body: JSON.stringify(payload) })
  }

  console.log('🚀 ~ selectedNode:', selectedNode)

  return (
    <div className="flex text-black h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      <div className="flex flex-col gap-2 min-w-64 bg-gray-100 p-3 border-r">
        <h2 className="font-bold">AWS Services</h2>
        <Input
          className="rounded-sm"
          placeholder="Search AWS Services"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />

        <div className="overflow-y-auto flex-1">
          {filteredServices.map((svc) => (
            <div
              key={svc.id}
              className="p-2 bg-white border rounded mb-2 cursor-move hover:bg-gray-200"
              draggable
              onDragStart={(e) => onDragStart(e, svc.id)}
            >
              {svc.displayName}
            </div>
          ))}
        </div>
        <Button onClick={exportConfig} className="w-full py-2">
          Deploy
        </Button>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={handleNodeClick}
          fitView
          proOptions={{ hideAttribution: true }}
          className="bg-black"
          deleteKeyCode={['Delete', 'Backspace']}
        >
          <Background />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>

      {/* Config Panel */}
      {selectedNode && (
        <div className="w-76 bg-gray-50 border-l p-3 flex flex-col gap-2">
          <h3 className="font-bold">Config {selectedNode.data.service.displayName}</h3>
          <div className="mb-2">
            <PromptConfigBox />
          </div>
          <div className="flex-1 overflow-y-auto px-2">
            {Object.keys(selectedNode.data.service.properties).map((cfgKey: string) => {
              const {
                Required: isRequired,
                PrimitiveType,
                value,
              } = selectedNode.data.service.properties[cfgKey]
              const isBoolean = PrimitiveType === 'Boolean'

              return (
                <div key={cfgKey} className="mb-2">
                  <label className="block text-sm font-medium mb-1">
                    {cfgKey}
                    {isRequired && <span className="text-red-500">*</span>}
                  </label>
                  {isBoolean ? (
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => handleConfigChange(cfgKey, checked)}
                    />
                  ) : (
                    <Input
                      value={value || ''}
                      onChange={(e) => handleConfigChange(cfgKey, e.target.value)}
                      className="w-full"
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
