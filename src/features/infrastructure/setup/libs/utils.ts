import { AwsService } from '@/features/aws/services/libs/types'
import { Edge, Node } from 'reactflow'
import { InfraData } from './types'

export function mappingReactFlowToInfraData(flowData: {
  nodes: Node<AwsService, string | undefined>[]
  edges: Edge<any>[]
}): InfraData {
  const resources: InfraData['resources'] = []
  const connections: InfraData['connections'] = []

  // Map nodes to resources
  for (const node of flowData.nodes) {
    const { id, data } = node

    // Convert properties back to plain object
    const properties: Record<string, any> = {}
    if (data.properties) {
      for (const [key, prop] of Object.entries(data.properties)) {
        if (prop && typeof prop === 'object' && 'value' in prop) {
          properties[key] = prop.value
        } else {
          properties[key] = prop
        }
      }
    }

    resources.push({
      id: id,
      type: data.resourceType || data.id,
      name: data.label || null,
      properties: properties,
    })
  }

  // Map edges to connections
  for (const edge of flowData.edges) {
    connections.push({
      id: edge.id,
      source: edge.source,
      target: edge.target,
    })
  }

  return {
    project: 'generated-project',
    region: 'ap-southeast-1',
    resources,
    connections,
  }
}

export function mappingInfraDataToReactFlow(infraData: InfraData): {
  nodes: Node<AwsService>[]
  edges: Edge[]
} {
  const nodes: Node<AwsService>[] = []
  const edges: Edge[] = []

  // Map resources to nodes
  infraData.resources.forEach((resource, index) => {
    const x = (index % 4) * 300 + 100
    const y = Math.floor(index / 4) * 200 + 100

    nodes.push({
      id: resource.id,
      type: 'default',
      position: { x, y },
      data: {
        id: resource.type,
        label: resource.name || resource.type.split('::').pop() || resource.type,
        displayName: resource.name || resource.type.split('::').pop() || resource.type,
        requiredProps: [],
        connections: {
          requiredConnections: [],
          recommendedConnections: [],
          optionalConnections: [],
        },
        resourceType: resource.type,
        properties: Object.entries(resource.properties).reduce(
          (acc, [key, value]) => {
            acc[key] = {
              value,
              type: Array.isArray(value) ? 'array' : typeof value,
            }
            return acc
          },
          {} as Record<string, { value: any; type: string }>
        ),
      },
    })
  })

  // Map connections to edges
  infraData.connections.forEach((connection) => {
    edges.push({
      id: connection.id,
      source: connection.source,
      target: connection.target,
      type: 'smoothstep',
      animated: true,
    })
  })

  return { nodes, edges }
}
