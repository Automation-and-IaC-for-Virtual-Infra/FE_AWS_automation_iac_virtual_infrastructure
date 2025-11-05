'use client'

import PromptConfigBox from '@/components/PromptConfigBox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  AwsService,
  AwsServiceConnection,
  ListAwsServicesData,
} from '@/features/aws/services/libs/types'
import { formatCamelCase } from '@/utils/string.utils'
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
import { GenerateInfra } from './components/GenerateInfra'
import { PreviewTerraformModal } from './components/TerraformPreviewModal'

// TODO: remove it
const MOCK_FILES = [
  {
    filename: 'main.tf',
    content:
      'provider "aws" {\n  region = "ap-southeast-1"\n}\n\nmodule "vpc" {\n  source = "./modules/vpc"\n  cidr_block = "10.0.0.0/16"\n}\n\nmodule "ec2" {\n  source = "./modules/ec2"\n  instance_type = "t3.micro"\n  ami = "ami-0abcdef1234567890"\n  subnet_id = module.vpc.public_subnet_id\n  key_name = "my-key"\n}',
  },
  {
    filename: 'variables.tf',
    content:
      'variable "region" {\n  description = "AWS region"\n  type = string\n  default = "ap-southeast-1"\n}\n\nvariable "instance_type" {\n  description = "EC2 instance type"\n  type = string\n  default = "t3.micro"\n}',
  },
  {
    filename: 'outputs.tf',
    content:
      'output "instance_public_ip" {\n  description = "Public IP of the EC2 instance"\n  value = module.ec2.public_ip\n}\n\noutput "vpc_id" {\n  description = "ID of created VPC"\n  value = module.vpc.vpc_id\n}',
  },
  {
    filename: 'modules/vpc/main.tf',
    content:
      'resource "aws_vpc" "this" {\n  cidr_block = var.cidr_block\n  enable_dns_support = true\n  enable_dns_hostnames = true\n  tags = { Name = "${terraform.workspace}-vpc" }\n}\n\nresource "aws_subnet" "public" {\n  vpc_id = aws_vpc.this.id\n  cidr_block = "10.0.1.0/24"\n  map_public_ip_on_launch = true\n  availability_zone = "ap-southeast-1a"\n  tags = { Name = "${terraform.workspace}-public-subnet" }\n}\n\noutput "public_subnet_id" {\n  value = aws_subnet.public.id\n}',
  },
  {
    filename: 'modules/ec2/main.tf',
    content:
      'resource "aws_instance" "this" {\n  ami = var.ami\n  instance_type = var.instance_type\n  subnet_id = var.subnet_id\n  key_name = var.key_name\n  tags = {\n    Name = "${terraform.workspace}-instance"\n  }\n}\n\noutput "public_ip" {\n  value = aws_instance.this.public_ip\n}',
  },
]

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

const BORDER_NODE = {
  default: '2px solid #ddd',
  selected: '2px solid #2563eb',
  required: '2px solid #ef4444',
  recommended: '2px solid #eab308',
  optional: '2px solid #22c55e',
}

const CONNECTION_COLORS = {
  suggest: '#2563eb',
  required: '#ef4444',
  recommended: '#eab308',
  optional: '#22c55e',
}

export default function InfrastructureSetup({ result }: { result: ListAwsServicesData }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<AwsService>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  const [selectedNode, setSelectedNode] = useState<Node<AwsService> | null>(null)
  const [searchValue, setSearchValue] = useState('')
  const [isShowGenerateInfra, setIsShowGenerateInfra] = useState(true)

  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStats, setConnectionStats] = useState({
    required: 0,
    recommended: 0,
    optional: 0,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [showModalTerraform, setShowModalTerraform] = useState(false)
  const [terraformFiles, setTerraformFiles] = useState<{ name: string; content: string }[]>([])

  const filteredServices = useMemo(() => {
    if (!searchValue) return result.services
    return result.services.filter((svc) =>
      svc.displayName.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [result.services, searchValue])

  // Sort properties of selected node: required first, then optional
  const sortedPropertiesSelectedNode = useMemo(() => {
    if (!selectedNode?.data?.properties) return []

    return Object.keys(selectedNode.data.properties).sort((a, b) => {
      const aRequired =
        selectedNode.data.requiredProps.includes(a) || selectedNode.data?.properties?.[a].Required
      const bRequired =
        selectedNode.data.requiredProps.includes(b) || selectedNode.data?.properties?.[b].Required
      return aRequired === bRequired ? 0 : aRequired ? -1 : 1
    })
  }, [selectedNode])

  const calculatedConnectionStats = useCallback(
    (connections: AwsServiceConnection) => {
      const stats = {
        required: 0,
        recommended: 0,
        optional: 0,
      }

      nodes.forEach((node) => {
        const targetServiceId = node.data?.id
        if (!targetServiceId) return

        if (connections.requiredConnections?.includes(targetServiceId)) {
          stats.required++
        } else if (connections.recommendedConnections?.includes(targetServiceId)) {
          stats.recommended++
        } else if (connections.optionalConnections?.includes(targetServiceId)) {
          stats.optional++
        }
      })

      setConnectionStats(stats)
    },
    [nodes]
  )

  const onConnectStart = useCallback(
    (_: any, { nodeId }: { nodeId: string | null }) => {
      if (!nodeId) return

      const sourceNode = nodes.find((n) => n.id === nodeId)
      if (!sourceNode?.data?.connections) return

      const connections = sourceNode.data.connections

      // Highlight nodes that can be connected
      setNodes((nds) =>
        nds.map((node) => {
          const targetServiceId = node.data?.id
          if (!targetServiceId) return node

          // Check which type of connection the target service belongs to
          let borderColor = ''
          let connectionType = ''

          if (connections.requiredConnections?.includes(targetServiceId)) {
            borderColor = '#ef4444' // đỏ
            connectionType = 'required'
          } else if (connections.recommendedConnections?.includes(targetServiceId)) {
            borderColor = '#eab308' // vàng
            connectionType = 'recommended'
          } else if (connections.optionalConnections?.includes(targetServiceId)) {
            borderColor = '#22c55e' // xanh lá
            connectionType = 'optional'
          }

          // If there is no connection, do not highlight
          if (!borderColor) return node

          return {
            ...node,
            style: {
              ...node.style,
              border: BORDER_NODE[connectionType as keyof typeof BORDER_NODE],
              boxShadow: `0 0 10px ${borderColor}`,
            },
          }
        })
      )

      setIsConnecting(true)
      calculatedConnectionStats(connections)
    },
    [calculatedConnectionStats, nodes, setNodes]
  )

  const onConnectEnd = useCallback(() => {
    setIsConnecting(false)
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        style: {
          ...node.style,
          border: node.id === selectedNode?.id ? BORDER_NODE.selected : BORDER_NODE.default,
          boxShadow: 'none',
        },
      }))
    )
  }, [setNodes, selectedNode])

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      const { source, target } = params
      if (!source || !target) return

      const sourceNode = nodes.find((n) => n.id === source)
      const targetNode = nodes.find((n) => n.id === target)

      // If node is not found or there is no connections configuration, do not allow connection
      if (!sourceNode || !sourceNode.data?.connections) {
        toast.error(`"${sourceNode?.data?.displayName}" cannot connect to any service.`)
        return
      }

      // If connections does not include target node's service id, do not allow connection
      const { requiredConnections, recommendedConnections, optionalConnections } =
        sourceNode.data.connections
      const listConnections = [
        ...(requiredConnections || []),
        ...(recommendedConnections || []),
        ...(optionalConnections || []),
      ]

      if (!targetNode?.data?.id || !listConnections.includes(targetNode?.data?.id)) {
        toast.error(
          `Cannot connect "${sourceNode.data.displayName}" to "${targetNode?.data?.displayName}".`
        )
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
    [setEdges, nodes]
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
      const service = result.services.find((s) => s.id === type)
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
          ...service,
        },
        style: {
          border: BORDER_NODE.selected,
          borderRadius: '8px',
        },
      }

      // remove all selected state from other nodes and add new node
      setNodes((nds) =>
        [
          nds.map((n) => ({
            ...n,
            style: {
              ...n.style,
              border: BORDER_NODE.default,
              borderRadius: '8px',
            },
          })),
          newNode,
        ].flat()
      )

      setSelectedNode(newNode)
    },
    [reactFlowInstance, result.services, setNodes]
  )

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  const handleNodeClick = (_: any, node: Node) => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        style: {
          ...n.style,
          border: n.id === node.id ? BORDER_NODE.selected : BORDER_NODE.default,
          borderRadius: '8px',
        },
      }))
    )
    setSelectedNode(node)
  }

  const handleConfigChange = (key: string, value: string | boolean) => {
    if (!selectedNode) return

    const { properties = {} } = selectedNode?.data
    const updatedNodes = [...nodes]
    const nodeIndex = updatedNodes.findIndex((n) => n.id === selectedNode?.id)
    if (nodeIndex === -1) return
    updatedNodes[nodeIndex] = {
      ...updatedNodes[nodeIndex],
      data: {
        ...updatedNodes[nodeIndex].data,
        properties: {
          ...properties,
          [key]: {
            ...properties[key],
            value,
          },
        },
      },
    }

    setNodes(updatedNodes)
    setSelectedNode(updatedNodes[nodeIndex])
  }

  const exportConfig = async () => {
    const payload = { nodes, edges }
    console.log('Send to BE:', payload)
    setIsLoading(true)
    setShowModalTerraform(true)

    // TODO: call API generate terraform files
    await new Promise((resolve) => setTimeout(resolve, 5000)) // simulate delay

    setIsLoading(false)
    setTerraformFiles(
      MOCK_FILES.map((file) => ({
        name: file.filename,
        content: file.content,
      }))
    )
  }

  const handleUnselectNode = () => {
    setSelectedNode(null)
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        style: {
          ...n.style,
          border: BORDER_NODE.default,
          borderRadius: '8px',
        },
      }))
    )
  }

  const handleApplySuggestion = useCallback(
    (suggestion: any) => {
      if (!suggestion || !reactFlowInstance) return

      try {
        const newNodes: Node[] = []
        const newEdges: Edge[] = []

        // Add services as nodes
        suggestion.services?.forEach((serviceId: string, index: number) => {
          const service = result.services.find((s) => s.id === serviceId)
          if (!service) return

          const position = reactFlowInstance.project({
            x: 100 + (index % 3) * 250,
            y: 100 + Math.floor(index / 3) * 150,
          })

          const nodeId = `${Date.now()}-${serviceId}-${index}`
          newNodes.push({
            id: nodeId,
            type: 'default',
            position,
            data: {
              label: service.displayName,
              ...service,
              _generatedId: serviceId, // Track original service ID
            },
            style: {
              border: BORDER_NODE.default,
              borderRadius: '8px',
            },
          })
        })

        setNodes(newNodes)

        // Add connections as edges
        setTimeout(() => {
          suggestion.connections?.forEach((conn: any) => {
            const sourceNode = newNodes.find((n) => n.data._generatedId === conn.source)
            const targetNode = newNodes.find((n) => n.data._generatedId === conn.target)

            if (sourceNode && targetNode) {
              newEdges.push({
                id: `${sourceNode.id}-${targetNode.id}`,
                source: sourceNode.id,
                target: targetNode.id,
                markerEnd: { type: MarkerType.ArrowClosed, width: 24, height: 24 },
                style: { stroke: CONNECTION_COLORS.suggest },
              })
            }
          })

          setEdges((eds) => [...eds, ...newEdges])
        }, 100)

        // Apply configs to nodes
        if (suggestion.configs) {
          setTimeout(() => {
            setNodes((nds) =>
              nds.map((node) => {
                const serviceId = node.data._generatedId
                if (serviceId && suggestion.configs[serviceId]) {
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      properties: {
                        ...node.data.properties,
                        ...suggestion.configs[serviceId],
                      },
                    },
                  }
                }
                return node
              })
            )
          }, 200)
        }

        toast.success('Infrastructure suggestion applied successfully!')
      } catch (error) {
        console.error('Error applying suggestion:', error)
        toast.error('Failed to apply infrastructure suggestion')
      }
    },
    [reactFlowInstance, result.services, setNodes, setEdges]
  )

  if (isShowGenerateInfra) {
    return (
      <GenerateInfra
        isOpen={isShowGenerateInfra}
        onClose={() => {
          setIsShowGenerateInfra(false)
        }}
        onApplySuggestion={handleApplySuggestion}
      />
    )
  }

  return (
    <>
      {showModalTerraform && (
        <PreviewTerraformModal
          open={showModalTerraform}
          onClose={() => setShowModalTerraform(false)}
          files={terraformFiles}
          loading={isLoading}
        />
      )}

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
          <Button onClick={exportConfig} className="w-full py-2 bg-green-500">
            Deploy
          </Button>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1 relative">
          {/* Connection Stats */}
          {isConnecting && (
            <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-4 border">
              <h4 className="font-bold text-sm mb-2">Connection Types</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-4 justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span>Required</span>
                  </div>
                  <span>{connectionStats.required}</span>
                </div>
                <div className="flex items-center gap-4 justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span>Recommended</span>
                  </div>
                  <span>{connectionStats.recommended}</span>
                </div>
                <div className="flex items-center gap-4 justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Optional</span>
                  </div>
                  <span>{connectionStats.optional}</span>
                </div>
              </div>
            </div>
          )}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
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
            <div className="flex justify-between">
              <h3 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {selectedNode.data.displayName}
              </h3>
              {/* close icon */}
              <button
                onClick={handleUnselectNode}
                className="text-gray-500 flex items-center justify-center size-6 cursor-pointer hover:bg-gray-200 rounded-sm"
              >
                <span className="text-2xl -mt-1">&times;</span>
              </button>
            </div>
            <div className="mb-2">
              <PromptConfigBox />
            </div>
            {selectedNode?.data?.properties && (
              <div className="flex-1 overflow-y-auto px-2">
                {sortedPropertiesSelectedNode.map((cfgKey: string) => {
                  const { Required, PrimitiveType, value } =
                    selectedNode.data?.properties?.[cfgKey] || {}
                  const isRequired = selectedNode.data.requiredProps.includes(cfgKey) || Required
                  const isBoolean = PrimitiveType === 'Boolean'

                  return (
                    <div key={cfgKey} className="mb-2">
                      <label className="block text-sm font-medium mb-1">
                        {formatCamelCase(cfgKey)}
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
                          className="w-full border border-gray-400"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
