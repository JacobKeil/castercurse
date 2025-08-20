export const region = [
  { name: 'APAC North' },
  { name: 'APAC South' },
  { name: 'Europe' },
  { name: 'North America' },
  { name: 'South America' }
]

export const status = [
  { name: 'Draft' },
  { name: 'Published' },
  { name: 'Completed' }
]

export const user = [
  { handle: 'nuclearhitman', display_name: 'NuclearHitman' }
]

export const event = [
  {
    name: 'EWC Scrims - Block 1',
    max_teams: 20,
    start_date: '2025-07-04T14:00:00.000Z',
    end_date: '2025-07-04T17:00:00.000Z',
    created_by: {
      connect: {
        handle: 'nuclearhitman'
      }
    },
    status: {
      connect: {
        name: 'Published'
      }
    },
    main_broadcast: {
      create: {
        handle: 'nicewigg',
        display_name: 'NiceWigg',
        created_by: { connect: { handle: 'nuclearhitman' } }
      }
    },
    watch_parties: {
      create: [
        { handle: 'greek', display_name: 'Greek', created_by: { connect: { handle: 'nuclearhitman' } } }
      ]
    },
    teams: {
      create: [
        {
          name: 'Al Qadsiah',
          region: {
            connect: {
              name: 'North America'
            }
          },
          created_by: {
            connect: {
              handle: 'nuclearhitman'
            }
          },
          channels: {
            create: [
              { handle: 'strafingflame', display_name: 'StrafingFlame', created_by: { connect: { handle: 'nuclearhitman' } } },
              { handle: 'theplayerkay', display_name: 'ThePlayerKay', created_by: { connect: { handle: 'nuclearhitman' } } },
              { handle: 'prycyy', display_name: 'Prycyy', created_by: { connect: { handle: 'nuclearhitman' } } }
            ]
          }
        },
        {
          name: 'EDward Gaming',
          region: {
            connect: {
              name: 'APAC South'
            }
          },
          created_by: {
            connect: {
              handle: 'nuclearhitman'
            }
          },
          channels: {
            create: [
              { handle: 'pite', display_name: 'Pite', created_by: { connect: { handle: 'nuclearhitman' } } },
              { handle: '3mz', display_name: '3Mz', created_by: { connect: { handle: 'nuclearhitman' } } },
              { handle: 'return0455', display_name: 'RETURN0455', created_by: { connect: { handle: 'nuclearhitman' } } }
            ]
          }
        },
        {
          name: 'Fnatic',
          region: {
            connect: {
              name: 'APAC North'
            }
          },
          created_by: {
            connect: {
              handle: 'nuclearhitman'
            }
          },
          channels: {
            create: [
              { handle: 'iq200yukaf', display_name: 'IQ200YukaF', created_by: { connect: { handle: 'nuclearhitman' } } },
              { handle: 'lible_ace3', display_name: 'Lible_Ace3', created_by: { connect: { handle: 'nuclearhitman' } } },
              { handle: 'kernel_garcia', display_name: 'がるしあ', created_by: { connect: { handle: 'nuclearhitman' } } }
            ]
          }
        },
        {
          name: 'Gen.G Esports',
          region: {
            connect: {
              name: 'APAC South'
            }
          },
          created_by: {
            connect: {
              handle: 'nuclearhitman'
            }
          },
          channels: {
            create: [
              { handle: 'asiazxd', display_name: 'ASIAZXD', created_by: { connect: { handle: 'nuclearhitman' } } },
              { handle: 'dexterstepsister', display_name: 'dexterstepsister', created_by: { connect: { handle: 'nuclearhitman' } } },
              { handle: 'z1ckky', display_name: 'Z1CKKY', created_by: { connect: { handle: 'nuclearhitman' } } }
            ]
          }
        },
        {
          name: 'KINOTROPE Gaming',
          region: {
            connect: {
              name: 'APAC North'
            }
          },
          created_by: {
            connect: {
              handle: 'nuclearhitman'
            }
          },
          channels: {
            create: [
              { handle: 'yukaperodator', display_name: 'yukaPEROdator', created_by: { connect: { handle: 'nuclearhitman' } } },
              { handle: 'kan0nsaaan', display_name: '叶望', created_by: { connect: { handle: 'nuclearhitman' } } },
              { handle: 'vol_zz', display_name: 'VOL_zZ', created_by: { connect: { handle: 'nuclearhitman' } } }
            ]
          }
        },
        {
          name: 'MOUZ',
          region: {
            connect: {
              name: 'Europe'
            }
          },
          created_by: {
            connect: {
              handle: 'nuclearhitman'
            }
          },
          channels: {
            create: [
              { handle: 'panlufka', display_name: 'panlufka', created_by: { connect: { handle: 'nuclearhitman' } } },
              { handle: 'zeronothing', display_name: 'ZeroNothing', created_by: { connect: { handle: 'nuclearhitman' } } },
              { handle: 'akkuger', display_name: 'akkuGER', created_by: { connect: { handle: 'nuclearhitman' } } }
            ]
          }
        },
        {
          name: 'Movister KOI',
          region: {
            connect: {
              name: 'North America'
            }
          },
          created_by: {
            connect: {
              handle: 'nuclearhitman'
            }
          },
          channels: {
            create: [
              { handle: 'funfps', display_name: 'FunFPS', created_by: { connect: { handle: 'nuclearhitman' } } },
              { handle: 'blinkzrr', display_name: 'Blinkzrr', created_by: { connect: { handle: 'nuclearhitman' } } },
              { handle: 'yjely', display_name: 'yJely', created_by: { connect: { handle: 'nuclearhitman' } } }
            ]
          }
        },
        {
          name: 'NOEZ FOXX',
          region: {
            connect: {
              name: 'North America'
            }
          },
          created_by: {
            connect: {
              handle: 'nuclearhitman'
            }
          },
          channels: {
            create: [
              { handle: '4rufq', display_name: '4rufq', created_by: { connect: { handle: 'nuclearhitman' } } },
              { handle: 'satuking_', display_name: 'satuking_', created_by: { connect: { handle: 'nuclearhitman' } } },
              { handle: 'lykq8don', display_name: 'lykq8don', created_by: { connect: { handle: 'nuclearhitman' } } }
            ]
          }
        },
        {
          name: 'Natus Vincere',
          region: {
            connect: {
              name: 'Europe'
            }
          },
          created_by: {
            connect: {
              handle: 'nuclearhitman'
            }
          },
          channels: {
            create: [
              { handle: 'uxako', display_name: 'Uxako', created_by: { connect: { handle: 'nuclearhitman' } } },
              { handle: 'hiarkayeah', display_name: 'hiarkayeah', created_by: { connect: { handle: 'nuclearhitman' } } },
              { handle: 'qslab', display_name: 'qslab', created_by: { connect: { handle: 'nuclearhitman' } } }
            ]
          }
        },
        {
          name: 'Ninjas In Pyjamas',
          region: { connect: { name: 'North America' } },
          created_by: { connect: { handle: 'nuclearhitman' } },
          channels: {
            create: [
              { display_name: 'Kurevv', handle: 'kurevv', created_by: { connect: { handle: 'nuclearhitman' } } },
              { display_name: 'Vein', handle: 'vein', created_by: { connect: { handle: 'nuclearhitman' } } },
              { display_name: 'McLovinFPS', handle: 'mclovinfps', created_by: { connect: { handle: 'nuclearhitman' } } }
            ]
          }
        },
        {
          name: 'ROC Esports',
          region: { connect: { name: 'North America' } },
          created_by: { connect: { handle: 'nuclearhitman' } },
          channels: {
            create: [
              { display_name: 'Deeds', handle: 'deeds', created_by: { connect: { handle: 'nuclearhitman' } } },
              { display_name: 'Vaxlon', handle: 'vaxlon', created_by: { connect: { handle: 'nuclearhitman' } } },
              { display_name: 'saucerorr', handle: 'saucerorr', created_by: { connect: { handle: 'nuclearhitman' } } }
            ]
          }
        },
        {
          name: 'S8UL Esports',
          region: { connect: { name: 'APAC South' } },
          created_by: { connect: { handle: 'nuclearhitman' } },
          channels: {
            create: [
              { display_name: 'jeskoesk', handle: 'jeskoesk', created_by: { connect: { handle: 'nuclearhitman' } } },
              { display_name: 'Sharky3415', handle: 'sharky3415', created_by: { connect: { handle: 'nuclearhitman' } } },
              { display_name: 'Legacyps2', handle: 'legacyps2', created_by: { connect: { handle: 'nuclearhitman' } } }
            ]
          }
        },
        {
          name: 'Sentinels',
          region: { connect: { name: 'North America' } },
          created_by: { connect: { handle: 'nuclearhitman' } },
          channels: {
            create: [
              { display_name: 'TheLOTR31', handle: 'thelotr31', created_by: { connect: { handle: 'nuclearhitman' } } },
              { display_name: 'rileyimekinac', handle: 'rileyimekinac', created_by: { connect: { handle: 'nuclearhitman' } } },
              { display_name: 'carterGK0', handle: 'cartergk0', created_by: { connect: { handle: 'nuclearhitman' } } }
            ]
          }
        },
        {
          name: 'TSM',
          region: { connect: { name: 'North America' } },
          created_by: { connect: { handle: 'nuclearhitman' } },
          channels: {
            create: [
              { display_name: 'gent', handle: 'gent', created_by: { connect: { handle: 'nuclearhitman' } } },
              { display_name: 'dooplex', handle: 'dooplex', created_by: { connect: { handle: 'nuclearhitman' } } },
              { display_name: 'PanicApex', handle: 'panicapex', created_by: { connect: { handle: 'nuclearhitman' } } }
            ]
          }
        },
        {
          name: 'Team Falcons',
          region: { connect: { name: 'North America' } },
          created_by: { connect: { handle: 'nuclearhitman' } },
          channels: {
            create: [
              { display_name: 'Zer0', handle: 'zer0', created_by: { connect: { handle: 'nuclearhitman' } } },
              { display_name: 'ImperialHal__', handle: 'imperialhal__', created_by: { connect: { handle: 'nuclearhitman' } } },
              { display_name: 'wxltzy', handle: 'wxltzy', created_by: { connect: { handle: 'nuclearhitman' } } }
            ]
          }
        },
        {
          name: 'Team Liquid',
          region: { connect: { name: 'North America' } },
          created_by: { connect: { handle: 'nuclearhitman' } },
          channels: {
            create: [
              { display_name: 'YanYa__', handle: 'yanya__', created_by: { connect: { handle: 'nuclearhitman' } } },
              { display_name: 'Neazul_', handle: 'neazul_', created_by: { connect: { handle: 'nuclearhitman' } } },
              { display_name: 'jaguares1', handle: 'jaguares1', created_by: { connect: { handle: 'nuclearhitman' } } }
            ]
          }
        },
        {
          name: 'Team Nemesis',
          region: { connect: { name: 'Europe' } },
          created_by: { connect: { handle: 'nuclearhitman' } },
          channels: {
            create: [
              { display_name: 'Kaishihaa', handle: 'kaishihaa', created_by: { connect: { handle: 'nuclearhitman' } } },
              { display_name: 'RemixPowers', handle: 'remixpowers', created_by: { connect: { handle: 'nuclearhitman' } } },
              { display_name: 'ZuniUK', handle: 'zuniuk', created_by: { connect: { handle: 'nuclearhitman' } } }
            ]
          }
        },
        {
          name: 'Team Orchid',
          region: { connect: { name: 'North America' } },
          created_by: { connect: { handle: 'nuclearhitman' } },
          channels: {
            create: [
              { display_name: 'luxford3', handle: 'luxford3', created_by: { connect: { handle: 'nuclearhitman' } } },
              { display_name: 'TheSirsay', handle: 'thesirsay', created_by: { connect: { handle: 'nuclearhitman' } } },
              { display_name: 'RamBeauski', handle: 'rambeauski', created_by: { connect: { handle: 'nuclearhitman' } } }
            ]
          }
        },
        {
          name: 'Virtus.Pro',
          region: { connect: { name: 'North America' } },
          created_by: { connect: { handle: 'nuclearhitman' } },
          channels: {
            create: [
              { display_name: 'zachmazer', handle: 'zachmazer', created_by: { connect: { handle: 'nuclearhitman' } } },
              { display_name: 'loustreams', handle: 'loustreams', created_by: { connect: { handle: 'nuclearhitman' } } },
              { display_name: 'SlayrSZN', handle: 'slayrszn', created_by: { connect: { handle: 'nuclearhitman' } } }
            ]
          }
        },
        {
          name: 'Zero Tenacity',
          region: { connect: { name: 'Europe' } },
          created_by: { connect: { handle: 'nuclearhitman' } },
          channels: {
            create: [
              { display_name: 'Feuda99', handle: 'feuda99', created_by: { connect: { handle: 'nuclearhitman' } } },
              { display_name: 'vMyse', handle: 'vmyse', created_by: { connect: { handle: 'nuclearhitman' } } },
              { display_name: 'Faenex', handle: 'faenex', created_by: { connect: { handle: 'nuclearhitman' } } }
            ]
          }
        }
      ]
    }
  }
]