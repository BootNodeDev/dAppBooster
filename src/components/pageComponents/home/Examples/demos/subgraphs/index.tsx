/**
 * Note: We're handling the exporting / importing this way so it's easier for the
 * installer script to handle removing the demo feature
 */
import subgraph from '@/src/components/pageComponents/home/Examples/demos/subgraphs/Subgraph'
import subgraphStatus from '@/src/components/pageComponents/home/Examples/demos/subgraphs/SubgraphStatus'

const subgraphs = [subgraph, subgraphStatus]

export default subgraphs
