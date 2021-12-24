const SMETA_CONTRACT = {
  ADDRESS: '0x09f33EC33052Cd253Db79fFA883E9c12Eb578309',
  ABI: [
    {
      inputs: [],
      name: 'index',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ],
};

const DHC_CONTRACT = {
  ADDRESS: '0x73b2aeC992fbb9573aA540916D1fE7bD4DE5e83C',
  ABI: [
    {
      inputs: [],
      name: 'minLockTime',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'bool', name: 'stake', type: 'bool' }],
      name: 'claim',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
      name: 'getReward',
      outputs: [
        { internalType: 'uint256', name: '', type: 'uint256' },
        { internalType: 'uint256', name: '', type: 'uint256' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
      name: 'getUnlockTime',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ],
};

export { DHC_CONTRACT, SMETA_CONTRACT };
