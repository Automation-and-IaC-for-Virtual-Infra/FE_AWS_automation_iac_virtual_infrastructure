'use client'

import LoadingContent from '@/components/LoadingContent'
import PromptConfigBox from '@/components/PromptConfigBox'
import { TagsInput } from '@/components/TagsInput'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  AwsService,
  AwsServiceConnection,
  ListAwsServicesData,
} from '@/features/aws/services/libs/types'
import { isExpiredDeployment } from '@/utils/storage'
import { formatCamelCase } from '@/utils/string'
import { useCallback, useEffect, useMemo, useState } from 'react'
import ReactFlow, {
  Background,
  Connection,
  Controls,
  Edge,
  MarkerType,
  MiniMap,
  Node,
  NodeTypes,
  ReactFlowInstance,
  addEdge,
  useEdgesState,
  useNodesState,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { toast } from 'sonner'
import { InfrastructureChat } from './components/InfrastructureChat'
import { PreviewTerraformModal } from './components/TerraformPreviewModal'
import { handleApplySpec, handleGenTerraform, handleGetTerraformFiles } from './libs/actions'
import { InfraData } from './libs/types'
import { mappingInfraDataToReactFlow, mappingReactFlowToInfraData } from './libs/utils'

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
  default: '#888',
  suggest: '#2563eb',
  required: '#ef4444',
  recommended: '#eab308',
  optional: '#22c55e',
}

const nodeTypes: NodeTypes = {}

export default function InfrastructureSetup({
  result,
  session_id,
  spec_json,
}: {
  result: ListAwsServicesData
  session_id?: string
  spec_json?: InfraData
}) {
  const isDeploying = useMemo(() => isExpiredDeployment(), [])

  const [nodes, setNodes, onNodesChange] = useNodesState<AwsService>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  const [selectedNode, setSelectedNode] = useState<Node<AwsService> | null>(null)
  const [searchValue, setSearchValue] = useState('')
  const [isShowInfrastructureChat, setIsShowInfrastructureChat] = useState(true)

  const [promptNode, setPromptNode] = useState<string>('')
  const [messagePromptNode, setMessagePromptNode] = useState<string>('')

  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStats, setConnectionStats] = useState({
    required: 0,
    recommended: 0,
    optional: 0,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPage, setIsLoadingPage] = useState(true)
  const [sessionId, setSessionId] = useState<string>('')
  const [showModalTerraform, setShowModalTerraform] = useState(false)
  const [showDiff, setShowDiff] = useState(false)
  const [terraformFiles, setTerraformFiles] = useState<
    { file_name: string; file_content: string }[]
  >([])

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

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            markerEnd: { type: MarkerType.ArrowClosed, width: 24, height: 24 },
            type: 'smoothstep',
            animated: true,
            style: { stroke: CONNECTION_COLORS.default },
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
          ...service,
          label: service.displayName,
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
      setPromptNode('')
      setMessagePromptNode('')
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
    setPromptNode('')
    setMessagePromptNode('')
  }

  const handleConfigChange = (key: string, value: any) => {
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
            value, // ✅ Accept any type: string, boolean, number, object, array
          },
        },
      },
    }

    setNodes(updatedNodes)
    setSelectedNode(updatedNodes[nodeIndex])
  }

  const generateTerraform = async () => {
    const payload = { nodes, edges }
    const res = await handleApplySpec(sessionId, mappingReactFlowToInfraData(payload))
    if (res.status === 'ok') {
      setIsShowInfrastructureChat(true)

      const resGenTf = await handleGenTerraform(sessionId)
      if (!resGenTf?.success && resGenTf?.message) {
        toast.error(resGenTf.message)
      }
    }
  }

  const openPreviewTerraform = async (
    sessionIdParam?: string,
    filesParam?: { file_name: string; file_content: string }[],
    showDiffParam?: boolean
  ) => {
    const currentSessionId = sessionIdParam || sessionId
    if (!currentSessionId) return

    try {
      setIsLoading(true)
      setShowModalTerraform(true)
      setShowDiff(showDiffParam || false)

      if (filesParam) {
        setTerraformFiles(filesParam)
      } else {
        const resGetTf = await handleGetTerraformFiles(currentSessionId)
        setTerraformFiles(resGetTf.files || [])
        if (resGetTf.message) {
          toast.success(resGetTf.message)
        }
      }
    } catch (_error) {
      toast.error('Failed to fetch Terraform files')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnselectNode = () => {
    setSelectedNode(null)
    setPromptNode('')
    setMessagePromptNode('')
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
    (
      { nodes: incomingNodes, edges: incomingEdges }: { nodes: Node[]; edges: Edge[] },
      session_id: string
    ) => {
      if (!session_id || !incomingNodes || !reactFlowInstance) return

      setSessionId(session_id)

      try {
        // Map incoming nodes with full service data from result.services
        const mappedNodes = incomingNodes.map((node) => {
          const service = result.services.find((s) => s.resourceType === node.data?.resourceType)

          if (!service) {
            console.warn(`Service not found for node:`, node)
            return node
          }

          return {
            ...node,
            type: 'default',
            data: {
              ...service,
              ...node.data,
              label: service.displayName,
              displayName: service.displayName,
              requiredProps: service.requiredProps || [],
              connections: service.connections || {
                requiredConnections: [],
                recommendedConnections: [],
                optionalConnections: [],
              },
              // Merge properties from service and incoming node
              properties: {
                ...service.properties,
                ...node.data?.properties,
              },
            },
            style: {
              ...node.style,
              border: BORDER_NODE.default,
              borderRadius: '8px',
            },
          }
        })

        // Map edges with proper styling
        const mappedEdges = incomingEdges.map((edge) => ({
          ...edge,
          markerEnd: { type: MarkerType.ArrowClosed, width: 24, height: 24 },
          style: {
            ...edge.style,
            stroke: CONNECTION_COLORS.suggest,
          },
        }))

        setNodes(mappedNodes)
        setEdges(mappedEdges)

        toast.success('Infrastructure applied successfully!')

        // Fit view to show all nodes
        setTimeout(() => {
          reactFlowInstance?.fitView({ padding: 0.2 })
        }, 100)
      } catch (error) {
        console.error('Error applying suggestion:', error)
        toast.error('Failed to apply infrastructure suggestion')
      }
    },
    [reactFlowInstance, result.services, setNodes, setEdges]
  )

  const handleApplyConfig = (config: { [key: string]: { value: any; type: string } }) => {
    if (!selectedNode) return

    console.log('Applying config to node:', selectedNode.id, config)

    const updatedNodes = [...nodes]
    const nodeIndex = updatedNodes.findIndex((n) => n.id === selectedNode?.id)
    if (nodeIndex === -1) return

    const currentProperties = updatedNodes[nodeIndex].data.properties || {}
    const newProperties = { ...currentProperties }

    Object.entries(config).forEach(([key, { value }]) => {
      newProperties[key] = {
        ...newProperties[key],
        value,
      }
    })

    updatedNodes[nodeIndex] = {
      ...updatedNodes[nodeIndex],
      data: {
        ...updatedNodes[nodeIndex].data,
        properties: newProperties,
      },
    }
    setNodes(updatedNodes)
    setSelectedNode(updatedNodes[nodeIndex])
  }

  useEffect(() => {
    if (spec_json && session_id) {
      handleApplySuggestion(mappingInfraDataToReactFlow(spec_json), session_id)
      setIsShowInfrastructureChat(false)
    }

    setIsLoadingPage(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session_id, spec_json])

  if (isLoadingPage) {
    return <LoadingContent loading={isLoadingPage}> </LoadingContent>
  }

  return (
    <>
      {!isDeploying && (
        <>
          <InfrastructureChat
            isOpen={isShowInfrastructureChat}
            onClose={() => {
              setIsShowInfrastructureChat(false)
            }}
            onApplySuggestion={handleApplySuggestion}
            onGoToPreviewTerraform={openPreviewTerraform}
          />

          {showModalTerraform && (
            <PreviewTerraformModal
              open={showModalTerraform}
              onClose={() => setShowModalTerraform(false)}
              sessionId={sessionId}
              files={terraformFiles}
              loading={isLoading}
              showDiff={showDiff}
            />
          )}
        </>
      )}

      <div className="flex text-black h-[calc(100vh-64px)] overflow-hidden">
        {/* Sidebar */}
        {!isDeploying && (
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
            <Button onClick={generateTerraform} className="w-full py-2 bg-green-500">
              Generate Terraform
            </Button>
          </div>
        )}

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
            nodeTypes={nodeTypes}
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
              <PromptConfigBox
                prompt={promptNode}
                setPrompt={setPromptNode}
                message={messagePromptNode}
                setMessage={setMessagePromptNode}
                resourceType={selectedNode.data.resourceType}
                onApplyConfig={handleApplyConfig}
              />
            </div>
            {selectedNode?.data?.properties && (
              <div className="flex-1 overflow-y-auto px-2">
                {sortedPropertiesSelectedNode.map((cfgKey: string) => {
                  const { Required, PrimitiveType, value } =
                    selectedNode.data?.properties?.[cfgKey] || {}

                  const isRequired = selectedNode.data.requiredProps.includes(cfgKey) || Required
                  const isTags = cfgKey.toLowerCase() === 'tags'
                  const isBoolean = PrimitiveType === 'Boolean' || typeof value === 'boolean'
                  const isArray = Array.isArray(value)
                  const isObject = value && typeof value === 'object' && !Array.isArray(value)

                  return (
                    <div key={cfgKey} className="mb-4">
                      <label className="block text-sm font-medium mb-1">
                        {formatCamelCase(cfgKey)}
                        {isRequired && <span className="text-red-500">*</span>}
                      </label>

                      {/* Tags - Array of {Key, Value} */}
                      {isTags ? (
                        <TagsInput
                          value={value || []}
                          onChange={(tags) => handleConfigChange(cfgKey, tags)}
                          disabled={isDeploying}
                        />
                      ) : /* Boolean - Switch */
                      isBoolean ? (
                        <Switch
                          checked={!!value}
                          onCheckedChange={(checked) => handleConfigChange(cfgKey, checked)}
                          disabled={isDeploying}
                        />
                      ) : /* Array - JSON Editor */
                      isArray ? (
                        <div className="space-y-2">
                          <textarea
                            value={JSON.stringify(value, null, 2)}
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(e.target.value)
                                handleConfigChange(cfgKey, parsed)
                              } catch (err) {
                                // Keep typing, don't update until valid JSON
                              }
                            }}
                            className="w-full min-h-[100px] p-2 border border-gray-400 rounded font-mono text-xs"
                            placeholder="Enter JSON array"
                            disabled={isDeploying}
                          />
                        </div>
                      ) : /* Object - JSON Editor */
                      isObject ? (
                        <div className="space-y-2">
                          <textarea
                            value={JSON.stringify(value, null, 2)}
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(e.target.value)
                                handleConfigChange(cfgKey, parsed)
                              } catch (err) {
                                // Keep typing, don't update until valid JSON
                              }
                            }}
                            className="w-full min-h-[100px] p-2 border border-gray-400 rounded font-mono text-xs"
                            placeholder="Enter JSON object"
                            disabled={isDeploying}
                          />
                        </div>
                      ) : (
                        /* String/Number - Input */
                        <Input
                          value={value ?? ''}
                          onChange={(e) => {
                            const val = e.target.value
                            // Try to parse as number if PrimitiveType is Integer/Double
                            if (PrimitiveType === 'Integer' || PrimitiveType === 'Double') {
                              const num = Number(val)
                              handleConfigChange(cfgKey, isNaN(num) ? val : num)
                            } else {
                              handleConfigChange(cfgKey, val)
                            }
                          }}
                          type={
                            PrimitiveType === 'Integer' || PrimitiveType === 'Double'
                              ? 'number'
                              : 'text'
                          }
                          className="w-full border border-gray-400"
                          disabled={isDeploying}
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
