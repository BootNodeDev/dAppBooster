export const OPL1CrossDomainMessengerProxyABI = [
  {
    inputs: [
      { internalType: 'address', name: '_target', type: 'address' },
      { internalType: 'bytes', name: '_message', type: 'bytes' },
      { internalType: 'uint32', name: '_minGasLimit', type: 'uint32' },
    ],
    name: 'sendMessage',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const
