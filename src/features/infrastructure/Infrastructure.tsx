'use client'

import { useCallback, useState } from 'react'
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

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

export default function InfrastructureManagement() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            markerStart: { type: MarkerType.ArrowClosed, width: 24, height: 24 },
          },
          eds
        )
      ),
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

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode: Node = {
        id: `${+new Date()}`,
        type: 'default',
        position,
        data: { label: type, config: {} },
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

  const handleConfigChange = (key: string, value: string) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNode?.id
          ? { ...n, data: { ...n.data, config: { ...n.data.config, [key]: value } } }
          : n
      )
    )
  }

  const exportConfig = () => {
    const payload = { nodes, edges }
    console.log('Send to BE:', payload)
    // fetch("/api/deploy", { method: "POST", body: JSON.stringify(payload) })
  }

  return (
    <div className="flex text-black h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div className="w-48 bg-gray-100 p-3 border-r">
        <h2 className="font-bold mb-3">AWS Services</h2>
        {['EC2', 'S3', 'RDS', 'Lambda', 'DynamoDB'].map((svc) => (
          <div
            key={svc}
            className="p-2 bg-white border rounded mb-2 cursor-move hover:bg-gray-200"
            draggable
            onDragStart={(e) => onDragStart(e, svc)}
          >
            {svc}
          </div>
        ))}
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
        <div className="w-64 bg-gray-50 border-l p-3">
          <h3 className="font-bold mb-2">Config {selectedNode.data.label}</h3>

          {selectedNode.data.label === 'EC2' && (
            <>
              <label className="block text-sm">Instance Type</label>
              <input
                type="text"
                className="border p-1 w-full mb-2"
                onChange={(e) => handleConfigChange('instanceType', e.target.value)}
                defaultValue={selectedNode.data.config?.instanceType || ''}
              />
              <label className="block text-sm">Region</label>
              <input
                type="text"
                className="border p-1 w-full"
                onChange={(e) => handleConfigChange('region', e.target.value)}
                defaultValue={selectedNode.data.config?.region || ''}
              />
            </>
          )}

          {selectedNode.data.label === 'S3' && (
            <>
              <label className="block text-sm">Bucket Name</label>
              <input
                type="text"
                className="border p-1 w-full"
                onChange={(e) => handleConfigChange('bucketName', e.target.value)}
                defaultValue={selectedNode.data.config?.bucketName || ''}
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}
