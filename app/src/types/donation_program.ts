export type DonationProgram = {
  "version": "0.1.0",
  "name": "donation_program",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "donateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initDonator",
      "accounts": [
        {
          "name": "donator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "donatorInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "donate",
      "accounts": [
        {
          "name": "donator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "donatorInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "donateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "donateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "to",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "donateAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "accountOwner",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "donators",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "ammount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "donatorInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "ammount",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "YouAreNotTheOwner",
      "msg": "Only owner can to withdraw"
    }
  ]
};

export const IDL: DonationProgram = {
  "version": "0.1.0",
  "name": "donation_program",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "donateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initDonator",
      "accounts": [
        {
          "name": "donator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "donatorInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "donate",
      "accounts": [
        {
          "name": "donator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "donatorInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "donateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "donateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "to",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "donateAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "accountOwner",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "donators",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "ammount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "donatorInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "ammount",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "YouAreNotTheOwner",
      "msg": "Only owner can to withdraw"
    }
  ]
};
