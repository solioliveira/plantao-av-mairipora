export interface DispatchActionGuide {
  id: string;
  problem: string;
  category: 'video' | 'audio' | 'power' | 'fm' | 'network' | 'stage';
  categoryLabel: string;
  urgency: 'Crítica' | 'Alta' | 'Média';
  targetLocation: string; // ONDE IR
  rackIdentifier: string; // IDENTIFICAÇÃO DO RACK OU PAINEL
  targetCableOrFiber: string; // QUAL CABO / FIBRA MEXER
  cableColorTag: string;
  steps: {
    stepNumber: number;
    title: string;
    action: string;
    warning?: string;
  }[];
  fallbackAction: string; // SE NÃO RESOLVER, FAÇA ISSO
}

export interface RackUnitItem {
  unitU: string;
  equipmentName: string;
  function: string;
  cablesConnected: string;
  normalStatusLed: string;
  troubleshootingTip: string;
}

export interface RackInfo {
  id: string;
  name: string;
  location: string;
  description: string;
  units: RackUnitItem[];
  fiberOpticalPorts?: {
    port: string;
    destination: string;
    fiberType: string;
    connector: string;
    colorCode: string;
    status: string;
    reservePort?: string;
  }[];
}

export const DISPATCH_ACTION_GUIDES: DispatchActionGuide[] = [
  {
    id: 'dsp-video-black',
    problem: 'Telão ou TVs com Tela Preta / Sem Sinal HDMI-SDI',
    category: 'video',
    categoryLabel: 'Vídeo / Telão',
    urgency: 'Crítica',
    targetLocation: 'Cabine Técnica -> Rack Lateral de Vídeo (MA-61-V02)',
    rackIdentifier: 'Rack de Vídeo MA-61-V02 (Abaixo dos Monitores de Prévia)',
    targetCableOrFiber: 'Fibra Monomodo Amarela (Conector LC Azul) -> Conversor SDI Blackmagic Mini #1 e #2',
    cableColorTag: 'Fibra Amarela LC/UPC Azul',
    steps: [
      {
        stepNumber: 1,
        title: 'Verifique o Conversor Blackmagic HDMI-to-SDI no Rack',
        action: 'Olhe para a gaveta 4U do Rack de Vídeo: localize os Micro Conversores Blackmagic. O LED verde "LOCK" precisa estar aceso fixo.',
        warning: 'Se o LED estiver piscando, o sinal da mesa ATEM não está chegando ao conversor.'
      },
      {
        stepNumber: 2,
        title: 'Inspecione a Fibra Óptica no DIO (Distribuidor Interno)',
        action: 'Localize a bandeja DIO 1U no rack. Veja a Porta 1 (Telão Esquerdo) e Porta 2 (Telão Direito). A fibra amarela está com conector LC azul encaixado até dar o "click"? Dê um toque suave para conferir a trava plástica.',
        warning: 'NUNCA dobre a fibra em ângulo reto ou force o cabo contra quinas metálicas do rack.'
      },
      {
        stepNumber: 3,
        title: 'Chaveamento para a Fibra Reserva B',
        action: 'Se a fibra principal estiver com falha (sem luz vermelha ou sem lock no receptor do telão), retire o conector LC azul da Porta 1 e conecte na Porta 3 (FIBRA RESERVA DE VÍDEO B). No telão, confirme com o assistente se a imagem retornou.',
      }
    ],
    fallbackAction: 'Se nenhuma fibra acender o lock, mude a saída PGM do Switcher ATEM para a porta HDMI direta reserva e passe o cabo HDMI longo de emergência direto para o splitter do salão.'
  },
  {
    id: 'dsp-audio-silent',
    problem: 'Sem Som Geral no Auditório (Mesa Modula mas Salão Está Mudo)',
    category: 'audio',
    categoryLabel: 'Áudio / Potência',
    urgency: 'Crítica',
    targetLocation: 'Cabine Técnica -> Rack Principal de Áudio (MA-61-E12-01)',
    rackIdentifier: 'Rack Principal de Áudio MA-61-E12-01 (Atrás da Mesa Qu-16)',
    targetCableOrFiber: 'Cabos XLR Balanceados de Saída do Processador DBX Venu360 para Amps Next Pro R2',
    cableColorTag: 'Cabo XLR Preto com Anéis Coloridos Neutrik',
    steps: [
      {
        stepNumber: 1,
        title: 'Olhe os 4 Amplificadores Next Pro R2 no Rack',
        action: 'Verifique os LEDs frontais dos 4 amplificadores. O LED deve estar VERDE (Ready/Sinal). Se estiver VERMELHO constante ("Protect"), o amplificador desarmou por curto nos cabos de caixa ou aquecimento.',
        warning: 'NUNCA desligue ou puxe fios com o amplificador ligado em Protect.'
      },
      {
        stepNumber: 2,
        title: 'Confira o Processador DBX Venu360 (Unidade 8U)',
        action: 'O visor do DBX está aceso com a cena "AUDITORIO_PADRAO"? Os VUs de INPUT 1/2 e OUTPUT 1 a 6 estão piscando com a música? Se os inputs piscam e os outputs não, o DBX está em MUTE GERAL. Pressione o botão [MUTE ALL] no painel para desmutar.',
      },
      {
        stepNumber: 3,
        title: 'Verifique o Gerenciador de Energia PM 1.3 do Rack',
        action: 'Confira se a régua do Gerenciador 1 (disjuntor de áudio) não desarmou. A tensão no voltímetro digital deve marcar entre 210V e 230V.',
      }
    ],
    fallbackAction: 'Caso o DBX Venu360 trave com tela branca, aperte o botão [AÇÃO] do Gerenciador de Energia 1 por 3 segundos para reiniciar os subsistemas de áudio em rampa suave.'
  },
  {
    id: 'dsp-stagebox-link',
    problem: 'Microfones do Palco / Tribuna Não Chegam na Mesa Qu-16',
    category: 'stage',
    categoryLabel: 'Palco / Medusa Digital',
    urgency: 'Crítica',
    targetLocation: 'Palco Lateral Esquerdo -> Medusa Digital StageBox (S16 / DL32)',
    rackIdentifier: 'Sub-palco Esquerdo: Caixa de Medusa Digital DL32',
    targetCableOrFiber: 'Cabo de Rede Azul Cat6 EtherCON Blindado (Porta AES50-A Palco <-> Cabine)',
    cableColorTag: 'Cabo Azul Cat6 EtherCON com Conector Metálico Neutrik',
    steps: [
      {
        stepNumber: 1,
        title: 'Olhe o LED de Sincronismo AES50 na StageBox do Palco',
        action: 'Na frente da Medusa DL32 no palco: verifique o LED "AES50". Ele DEVE estar VERDE CONTÍNUO. Se estiver piscando ou VERMELHO, significa que o cabo de rede perdeu a sincronização do clock com a mesa.',
        warning: 'Sem o LED AES50 verde fixo, nenhum microfone ou retorno do palco funcionará.'
      },
      {
        stepNumber: 2,
        title: 'Reencaixe o Conector EtherCON no Palco e na Cabine',
        action: 'Pressione a trava metálica superior do conector EtherCON Neutrik, retire e recoloque até ouvir o clique mecânico. Verifique se o cabo não foi pisado ou prensado pela porta de acesso ao palco.',
      },
      {
        stepNumber: 3,
        title: 'Mude para o Cabo AES50 Reserva (Porta AES50-B)',
        action: 'Se o conector A estiver com mau contato, transfira o cabo para a porta "AES50-B" (Link Redundante) tanto na Stagebox quanto na traseira da mesa Qu-16.',
      }
    ],
    fallbackAction: 'Em emergência total de palco sem sinal digital, use o Cabo Multicabo Analógico reserva de 4 pares XLR localizado no nicho do subpalco direto para a entrada local 1 da mesa.'
  },
  {
    id: 'dsp-power-breaker',
    problem: 'Disjuntor Desarmado / Queda Parcial em Telões ou Caixas',
    category: 'power',
    categoryLabel: 'Elétrica / QGBT',
    urgency: 'Crítica',
    targetLocation: 'Sala Técnica de Elétrica ao Lado da Cabine -> Quadro QGBT-AV',
    rackIdentifier: 'Quadro Geral de Baixa Tensão QGBT-AV (Painel Metálico Cinza)',
    targetCableOrFiber: 'Disjuntores Bipolares DIN Schneider DJ-AV01 a DJ-AV05',
    cableColorTag: 'Barramento de Cobre e Fiação 6mm² Vermelho/Preto',
    steps: [
      {
        stepNumber: 1,
        title: 'Identifique o Disjuntor que Desarmou na Chave',
        action: 'Abra a porta do quadro elétrico QGBT-AV com a chave que fica pendurada na cabine. Olhe a fileira de disjuntores: se a manopla estiver no meio (laranja/vermelha), ele disparou por sobrecarga.',
        warning: 'NUNCA force um disjuntor para cima se ele desarmar imediatamente pela segunda vez (indica curto-circuito real).'
      },
      {
        stepNumber: 2,
        title: 'Mapeamento das Cargas dos Disjuntores:',
        action: 'DJ-AV01: Mesa Qu-16, Switcher ATEM e PCs (Nobreak) | DJ-AV02: Amps Subwoofers e Front PA | DJ-AV03: Amps Caixas Delay de Fundo | DJ-AV04: Telões e Processador de Led | DJ-AV05: Ar-condicionado Cabine.',
      },
      {
        stepNumber: 3,
        title: 'Procedimento Seguro de Religamento',
        action: 'Para rearmar: empurre a manopla totalmente para BAIXO (desligado completo) e depois suba com firmeza para CIMA até travar em LIGADO. Aguarde 5 segundos e confira se a carga estabilizou.',
      }
    ],
    fallbackAction: 'Se o disjuntor DJ-AV04 dos telões desarmar repetidamente, mantenha os monitores laterais e reduza o brilho do painel de LED para 60% no software Novastar.'
  },
  {
    id: 'dsp-fm-antenna',
    problem: 'Rádio FM com Chiado Intenso ou Perda de Alcance no Auditório',
    category: 'fm',
    categoryLabel: 'Transmissão FM',
    urgency: 'Alta',
    targetLocation: 'Cabine Técnica -> Sub-rack Lateral de Transmissores FM',
    rackIdentifier: 'Sub-rack Lateral FM (Módulo de 2U com Transmissores Digitais)',
    targetCableOrFiber: 'Cabo Coaxial RG-58 50Ω com Conector BNC -> Antena Externa Dipolo no Forro',
    cableColorTag: 'Cabo Coaxial Preto RG-58 com Conector Metálico BNC de Rosca',
    steps: [
      {
        stepNumber: 1,
        title: 'Inspecione a Trava BNC da Antena do Transmissor',
        action: 'Atrás do transmissor FM: segure o conector BNC de metal e confirme se a trava de baioneta está girada e firme. Se estiver frouxa, a impedância sobe e o sinal perde 80% do alcance.',
        warning: 'Operar transmissor FM com antena desconectada queima o estágio final de RF.'
      },
      {
        stepNumber: 2,
        title: 'Confira a Frequência e Potência no Visor Digital',
        action: 'Auditório A: 72.1 MHz (Auditivo) e 72.9 MHz (Audiodescrição). Auditório B: 75.5 MHz (Auditivo) e 72.7 MHz (Audiodescrição). Potência deve indicar entre 0.5W e 1.0W.',
      },
      {
        stepNumber: 3,
        title: 'Verifique o Cabo de Áudio de Entrada (XLR/P10 da Qu-16)',
        action: 'Veja se o cabo vindo da saída [Matrix 1-2] ou [Master L/R] da mesa Qu-16 está bem engatado. Se os VUs de áudio do transmissor estiverem apagados, o som não está saindo da mesa.',
      }
    ],
    fallbackAction: 'Tenha à mão a Antena Telescópica de emergência rosqueável diretamente na traseira do transmissor caso o cabo que sobe para o forro tenha rompido.'
  },
  {
    id: 'dsp-ptz-camera',
    problem: 'Câmera PTZ Travada, Não Responde ao Joystick da AW-RP50',
    category: 'video',
    categoryLabel: 'Câmeras PTZ',
    urgency: 'Alta',
    targetLocation: 'Bancada de Vídeo -> Controladora AW-RP50 e Switch PoE de Rede',
    rackIdentifier: 'Rack de Rede e Câmeras: Switch PoE 8 Portas Gigabit',
    targetCableOrFiber: 'Cabo de Rede Patch Cord Amarelo Cat6 RJ45 (Portas 1 a 3 no Switch PoE)',
    cableColorTag: 'Patch Cord de Rede Amarelo Cat6 com Conector RJ45 Transparente',
    steps: [
      {
        stepNumber: 1,
        title: 'Verifique os LEDs de Porta no Switch PoE (Rack de Vídeo)',
        action: 'Localize o Switch PoE TP-Link no Rack de Vídeo. Olhe as Portas 1 (Cam 1), 2 (Cam 2) e 3 (Cam 3). Os LEDs de Link (Verde) e de PoE (Laranja) devem estar ACESOS contínuos.',
        warning: 'Se o LED PoE laranja estiver apagado, a câmera no pilar está completamente sem energia.'
      },
      {
        stepNumber: 2,
        title: 'Reboot Remoto da Câmera pelo Switch PoE',
        action: 'Desconecte o cabo de rede da porta da câmera com defeito no Switch PoE por 5 segundos e reconecte. A câmera reiniciará seu ciclo de auto-calibração mecânica (gira 360° e volta ao preset inicial).',
      },
      {
        stepNumber: 3,
        title: 'Ressincronize o IP na Controladora Panasonic AW-RP50',
        action: 'No painel da AW-RP50: pressione o botão [CAMERA] e selecione o número da câmera. Pressione o botão [USER 1] para forçar o handshake de rede IP.',
      }
    ],
    fallbackAction: 'Se uma câmera queimar, ative o corte para a Câmera 2 ou 3 em enquadramento geral e faça o programa com as 2 câmeras restantes sem interromper a transmissão.'
  }
];

export const RACK_EQUIPMENT_DATA: RackInfo[] = [
  {
    id: 'rack-audio-01',
    name: 'Rack Principal de Áudio (MA-61-E12-01)',
    location: 'Cabine Técnica de Áudio / Atrás do Posto do Operador da Qu-16',
    description: 'Central de processamento, roteamento digital, amplificação e alimentação ininterrupta do som do auditório.',
    units: [
      {
        unitU: '1U - 2U',
        equipmentName: 'Gerenciadores de Energia Inteligentes PM 1.3 PC 220V',
        function: 'Sequenciamento de energia temporizado dos amplificadores para evitar estouros nas caixas.',
        cablesConnected: 'Alimentação geral 220V trifásica balanceada + saídas C13 para os amplificadores',
        normalStatusLed: 'Display digital azul exibindo 220V ±5V e leds verdes de sequenciamento acesos',
        troubleshootingTip: 'Nunca force o desligamento no botão geral; aperte o botão [AÇÃO] por 2 segundos para sequenciamento correto.'
      },
      {
        unitU: '3U',
        equipmentName: 'Processador Digital de Áudio DBX DriveRack Venu360',
        function: 'Gerenciamento de crossover, delay das caixas do fundo, equalização da sala e limiter de proteção acústica.',
        cablesConnected: '2 XLR Inputs da Qu-16 (Master L/R) + 6 XLR Outputs para os 4 Amplificadores Next Pro',
        normalStatusLed: 'Visor LCD azul com cena "AUDITORIO_PADRAO", VUs verdes piscando suavemente (-18 a 0 dB)',
        troubleshootingTip: 'Se os outputs estiverem mudos com som na mesa, confirme se a função [MUTE ALL] não foi ativada acidentalmente no painel.'
      },
      {
        unitU: '4U - 7U',
        equipmentName: '4x Amplificadores de Potência Next Pro R2 (4 Canais)',
        function: 'Amplificação do Front PA (caixas principais), Subwoofers, Retorno de Palco e Linha de Delay do fundo.',
        cablesConnected: 'Entradas XLR balanceadas + Saídas Speakon NL4 de alta potência para as caixas acústicas',
        normalStatusLed: 'LEDs azuis frontais acesos ("Power"), LEDs verdes modulando ("Signal"), ZERO LEDs vermelhos de Protect',
        troubleshootingTip: 'Se algum canal entrar em "Protect" vermelho, desligue o amplificador específico e verifique se não há curto no borne de alto-falante.'
      },
      {
        unitU: '8U - 10U',
        equipmentName: 'Nobreak APC Smart-UPS 2200VA com Chave ATS',
        function: 'Autonomia de bateria de 25 minutos para manter consoles, processadores e PCs durante a transição para gerador.',
        cablesConnected: 'Entrada bivolt 220V da rede + cabos de saída para régua de tomadas da cabine técnica',
        normalStatusLed: 'LED verde "Online" fixo, sem alarmes sonoros tipo bipe',
        troubleshootingTip: 'Se o nobreak começar a apitar contínuo durante queda de luz, verifique no painel a carga da bateria (deve aguentar até o gerador assumir em 1 minuto).'
      }
    ]
  },
  {
    id: 'rack-video-01',
    name: 'Rack de Vídeo & DIO de Fibra Óptica (MA-61-V02)',
    location: 'Cabine Técnica de Vídeo / Abaixo do Switcher ATEM e Monitores de Prévia',
    description: 'Distribuição dos sinais SDI, HDMI, fibra óptica dos telões e comutação das câmeras PTZ.',
    fiberOpticalPorts: [
      {
        port: 'Porta 1',
        destination: 'Telão Principal Central (Painel de LED / Projeção)',
        fiberType: 'Monomodo 9/125µm',
        connector: 'LC/UPC (Azul)',
        colorCode: 'Fibra Amarela - Pigtail 01',
        status: 'Ativa / Primária',
        reservePort: 'Porta 3 (Fibra Reserva B)'
      },
      {
        port: 'Porta 2',
        destination: 'Telões Laterais / Monitores de Apoio do Auditório',
        fiberType: 'Monomodo 9/125µm',
        connector: 'LC/UPC (Azul)',
        colorCode: 'Fibra Amarela - Pigtail 02',
        status: 'Ativa / Primária',
        reservePort: 'Porta 4 (Fibra Reserva B)'
      },
      {
        port: 'Porta 3',
        destination: 'Link de Redundância (Backup Auditório A <-> B)',
        fiberType: 'Monomodo 9/125µm',
        connector: 'LC/UPC (Azul)',
        colorCode: 'Fibra Amarela - Pigtail 03 (Reserva Imediata)',
        status: 'Reserva Pronta para Chaveamento',
      },
      {
        port: 'Porta 4',
        destination: 'Transmissão JW Stream & Sala de Apoio Extra',
        fiberType: 'Monomodo 9/125µm',
        connector: 'SC/APC (Verde)',
        colorCode: 'Fibra Amarela - Pigtail 04',
        status: 'Ativa',
      }
    ],
    units: [
      {
        unitU: '1U',
        equipmentName: 'Distribuidor Interno Óptico (DIO) 12 Fibras Monomodo',
        function: 'Terminação e manobra das fibras ópticas que chegam dos telões, palco e link entre auditórios.',
        cablesConnected: 'Cabos de fibra amarela monomodo com conectores LC azuis de engate rápido',
        normalStatusLed: 'Sem LEDs (passivo) - inspeção visual do acoplamento mecânico com clique firme',
        troubleshootingTip: 'Se um telão perder imagem repentinamente, retire o conector da Porta 1 e pluge na Porta 3 (Reserva) em 10 segundos.'
      },
      {
        unitU: '2U',
        equipmentName: 'Switcher de Produção Blackmagic ATEM Television Studio HD',
        function: 'Mesa de corte de vídeo: recebe Câmeras 1, 2, 3, PC-1 e PC-2 e envia o sinal PGM para os telões.',
        cablesConnected: '4x Cabos BNC SDI Belden 1694A + 2x Cabos HDMI 2.0 blindados + Saída PGM SDI',
        normalStatusLed: 'Botão PGM ativo aceso em Vermelho vivo, botão Preview em Verde',
        troubleshootingTip: 'Se os botões não responderem, verifique o cabo de rede Ethernet traseiro que comunica com o software ATEM Control no computador.'
      },
      {
        unitU: '3U',
        equipmentName: 'Mini Conversores Blackmagic SDI para HDMI e HDMI para SDI',
        function: 'Conversão dos sinais entre placas gráficas dos PCs, câmeras e distribuidores de fibra.',
        cablesConnected: 'Cabos SDI de 75 Ohms + Fontes 12V conectadas em réguas com trava',
        normalStatusLed: 'LED verde "LOCK" aceso contínuo em cada conversor',
        troubleshootingTip: 'Se o LED LOCK estiver apagado ou piscando, a fonte 12V se soltou ou o cabo SDI na entrada está frouxo.'
      },
      {
        unitU: '4U',
        equipmentName: 'Switch PoE 8 Portas Gigabit TP-Link Omada',
        function: 'Alimentação elétrica e controle IP das 3 câmeras robóticas Panasonic PTZ e controladora AW-RP50.',
        cablesConnected: 'Cabos de rede amarelos Cat6 conectando AW-RP50 e Câmeras 1, 2 e 3',
        normalStatusLed: 'LEDs verdes de Link 1000Mbps e LEDs laranjas de alimentação PoE acesos contínuos',
        troubleshootingTip: 'Para reiniciar uma câmera travada, desconecte o cabo de rede no switch por 5 segundos e reconecte.'
      }
    ]
  },
  {
    id: 'stagebox-palco-01',
    name: 'Medusa Digital de Palco StageBox (S16 / DL32)',
    location: 'Palco Lateral Esquerdo / Sub-palco de Apoio',
    description: 'Coleta de todos os microfones da tribuna, leitores, entrevistas e envio para o retorno de chão do palco.',
    units: [
      {
        unitU: 'Painel Frontal',
        equipmentName: 'Medusa Digital DL32 (32 Entradas XLR Midas Pro / 16 Saídas XLR)',
        function: 'Pré-amplificação e conversão analógica-digital no palco, enviando áudio via rede AES50 para a cabine.',
        cablesConnected: 'Canal 1 (Tribuna XLR), Canais 2-4 (Palco), Canais 15-16 (Retorno de Palco) + Cabo Azul Cat6 EtherCON AES50-A',
        normalStatusLed: 'LED AES50 verde fixo, LEDs verdes de Phantom Power 48V ativos nos canais de microfone condensador',
        troubleshootingTip: 'Se a tribuna ficar sem som, verifique se o conector XLR do pedestal está com a trava Neutrik travada e o cabo não está sob a base do pedestal elétrico.'
      }
    ]
  }
];
