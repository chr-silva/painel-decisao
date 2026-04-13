/*
 * ============================================================
 * PAINEL DE DECISÃO - 13 DIAS AO ABISMO
 * Sistema de votação em tempo real (Firestore Versão)
 * ============================================================
 */

// 1. CONFIGURAÇÃO DO FIREBASE (Suas credenciais inseridas)
const firebaseConfig = {
  apiKey: "AIzaSyA_E11qH6C-sApWOv2J8KbFAOKG948PHQs",
  authDomain: "oss-teste-db.firebaseapp.com",
  databaseURL: "https://oss-teste-db-default-rtdb.firebaseio.com",
  projectId: "oss-teste-db",
  storageBucket: "oss-teste-db.firebasestorage.app",
  messagingSenderId: "340015106460",
  appId: "1:340015106460:web:952749eea07d82b72b6059",
  measurementId: "G-1YV4323RZE"
};

// 2. INICIALIZAÇÃO DO BANCO
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 3. ESTADO LOCAL DA APLICAÇÃO
let votes = { 1: 0, 2: 0, 3: 0 };
let isWaiting = false;
let hasVoted = false;

// 4. INICIALIZAÇÃO AO CARREGAR PÁGINA
document.addEventListener('DOMContentLoaded', function () {
  checkIfAlreadyVoted();
  initAdminFields();
  listenToFirebase(); // Conecta o ouvinte em tempo real
});

// 5. REGISTRO DE VOTO
function registerVote(option) {
  if (hasVoted) return;

  hasVoted = true;
  localStorage.setItem('painel_voted', 'true');
  localStorage.setItem('painel_voted_option', option.toString());

  // Incrementa o voto diretamente no Firebase
  db.collection('sessions').doc('current').update({
    [`votes.${option}`]: firebase.firestore.FieldValue.increment(1)
  });

  disableButtons();
  showVotedMessage();
}

// 6. ATUALIZAÇÃO DA INTERFACE (Gráficos e Números)
function updateDisplay() {
  const total = votes[1] + votes[2] + votes[3];
  let maxVotes = 0;
  let winnerOption = 0;

  for (let i = 1; i <= 3; i++) {
    const count = votes[i];
    const percent = total > 0 ? Math.round((count / total) * 100) : 0;

    document.getElementById('vote-count-' + i).textContent = count + (count === 1 ? ' voto' : ' votos');
    document.getElementById('vote-percent-' + i).textContent = percent + '%';
    document.getElementById('progress-' + i).style.width = percent + '%';

    if (count > maxVotes && count > 0) {
      maxVotes = count;
      winnerOption = i;
    }
  }

  document.getElementById('total-votes').textContent = total;

  // Destacar a opção vencedora
  document.querySelectorAll('.vote-btn').forEach(btn => btn.classList.remove('winner'));
  if (winnerOption > 0) {
    const winnerBtn = document.querySelector('.vote-btn-' + winnerOption);
    if (winnerBtn) winnerBtn.classList.add('winner');
  }
}

// 7. CONTROLE DE BOTÕES E MENSAGENS
function disableButtons() {
  document.querySelectorAll('.vote-btn').forEach(btn => {
    btn.classList.add('disabled-btn');
    btn.setAttribute('disabled', 'true');
  });
}

function enableButtons() {
  document.querySelectorAll('.vote-btn').forEach(btn => {
    btn.classList.remove('disabled-btn');
    btn.removeAttribute('disabled');
  });
}

function checkIfAlreadyVoted() {
  if (localStorage.getItem('painel_voted') === 'true') {
    hasVoted = true;
    disableButtons();
    showVotedMessage();
  }
}

function showVotedMessage() {
  document.getElementById('already-voted').style.display = 'block';
}

// 8. FUNÇÕES DE ADMINISTRAÇÃO (Notebook do Apresentador)
function toggleAdmin() {
  const senhaDefinida = "1962"; // Escolha sua senha (ex: ano da crise dos mísseis)
  const painel = document.getElementById('admin-panel');

  // Se o painel já estiver aberto, apenas fecha
  if (painel.style.display === 'block') {
    painel.style.display = 'none';
    return;
  }

  // Se estiver fechado, pede a senha
  const tentativa = prompt("Digite a credencial de acesso ao Comando Estratégico:");

  if (tentativa === senhaDefinida) {
    painel.style.display = 'block';
  } else {
    alert("ACESSO NEGADO. Tentativa reportada ao Pentágono.");
  }
}

function toggleWaiting() {
  isWaiting = !isWaiting;
  db.collection('sessions').doc('current').update({
    active: !isWaiting
  });
}

function resetVotes() {
  if (confirm("Deseja realmente zerar todos os votos?")) {
    localStorage.removeItem('painel_voted');
    localStorage.removeItem('painel_voted_option');
    
    db.collection('sessions').doc('current').update({
      votes: { "1": 0, "2": 0, "3": 0 }
    }).then(() => {
        // Recarrega a página para resetar o estado de quem já votou
        window.location.reload();
    });
  }
}

function updateSceneText() {
  const text = document.getElementById('admin-scene-text').value;
  if (text.trim() !== '') {
    db.collection('sessions').doc('current').update({
      sceneText: text
    });
  }
}

function updateOptions() {
  db.collection('sessions').doc('current').update({
    options: {
      "1": document.getElementById('admin-option-1').value,
      "2": document.getElementById('admin-option-2').value,
      "3": document.getElementById('admin-option-3').value
    }
  });
}

function initAdminFields() {
  document.getElementById('admin-scene-text').value = document.getElementById('scene-text').textContent.trim();
  for (let i = 1; i <= 3; i++) {
    document.getElementById('admin-option-' + i).value = document.getElementById('option-text-' + i).textContent.trim();
  }
}

// 9. OUVINTE EM TEMPO REAL (Atualiza todos os clientes instantaneamente)
function listenToFirebase() {
  db.collection('sessions').doc('current').onSnapshot(function (doc) {
    if (doc.exists) {
      const data = doc.data();

      // Atualiza votos
      if (data.votes) {
        votes[1] = data.votes["1"] || 0;
        votes[2] = data.votes["2"] || 0;
        votes[3] = data.votes["3"] || 0;
        updateDisplay();
      }

      // Atualiza texto da cena
      if (data.sceneText) {
        document.getElementById('scene-text').textContent = data.sceneText;
      }

      // Atualiza textos das opções
      if (data.options) {
        for (let i = 1; i <= 3; i++) {
          if (data.options[i]) {
            document.getElementById('option-text-' + i).textContent = data.options[i];
          }
        }
      }

      // Alterna entre Votação e Tela de Espera
      if (typeof data.active !== 'undefined') {
        const vSec = document.getElementById('voting-section');
        const wSec = document.getElementById('waiting-section');
        if (data.active) {
          vSec.style.display = 'block';
          wSec.style.display = 'none';
        } else {
          vSec.style.display = 'none';
          wSec.style.display = 'block';
        }
      }
    }
  }, function(error) {
      console.error("Erro no Listener: ", error);
  });
}

// ==========================================
//  SISTEMA DE PRESETS (CONFIGURAÇÃO)
// ==========================================
const presets = {
    1: {
        scene: "Um avião U-2 capturou imagens de mísseis em Cuba. Que decisão devo tomar?",
        opt1: "Convocar o ExComm imediatamente. Assumir o risco de pânico interno.",
        opt2: "Confirmar com mais análises. Se estiver errado, evitamos um desastre diplomático.",
        opt3: "Reunião restrita e silenciosa. Manter controle da informação a qualquer custo."
    },
    2: {
        scene: "Há, de fato, mísseis em Cuba. O que devo fazer sabendo disso?",
        opt1: "Ataque cirúrgico imediato. Destruir os mísseis antes que se tornem operacionais",
        opt2: "Abrir canal secreto com Khrushchev. Resolver antes que o mundo descubra.",
        opt3: "Impor bloqueio naval. Forçar confronto controlado sem iniciar guerra direta."
    },
    3: {
        scene: "Atacar as bases com os mísseis da U.R.S.S. acabou trazendo uma tensão global imensurável. O que devo fazer?",
        opt1: "Ordenar contra-ataque imediato! Destruir bases soviéticas na Turquia!.",
        opt2: "Tentar negociação de emergência. Ligar direto para Khrushchev.",
        opt3: "Ativar protocolo de retirada. Retirar as tropas dos locais de ataque."
    },
    4: {
        scene: "Um navio cargueiro soviético 'Poltava' se aproxima e ameaça ultrapassar o limite estabelecido pela 'quarentena' estabelecida por nós. O que faço?",
        opt1: "Permitir a passagem. Evitar confronto direto, mesmo que pareça recuo.",
        opt2: "Emitir aviso final. Se cruzar a linha, será interceptado.",
        opt3: "Disparar tiro de advertência. Mostrar força sem atacar diretamente."
    },
    5: {
        scene: "Krushchev parece estar disposto a negociar conosco de forma pacífica. Porém, qual a melhor forma de conduzir o acordo?",
        opt1: "Aceitar os termos. Garantir paz imediata, mesmo com custo político.",
        opt2: "Propor troca completa: Cuba por Turquia. Resolver a crise de forma equilibrada.",
        opt3: "Rejeitar e exigir retirada imediata. Demonstrar força total."
    },
    6: {
        scene: "O ultimato enviado à U.R.S.S. exigindo retirada dos mísseis de Cuba foi negado. A situação agora está extremamente tensa. O que devo fazer?",
        opt1: "Recuar silenciosamente. Aceitar o acordo e preservar vidas.",
        opt2: "Manter o ultimato. Apostar que os soviéticos recuarão primeiro.",
        opt3: "Aguardar sem agir. Apostar no tempo e na hesitação do inimigo."
    }
};

function loadPreset(num) {
    const p = presets[num];
    if (!p) return;

    // 1. Atualiza os campos de input no painel admin (para você ver o que vai enviar)
    document.getElementById('admin-scene-text').value = p.scene;
    document.getElementById('admin-option-1').value = p.opt1;
    document.getElementById('admin-option-2').value = p.opt2;
    document.getElementById('admin-option-3').value = p.opt3;

    // 2. Opcional: Já envia direto para o Firebase e reseta os votos
    // Recomendo deixar assim para ser um clique só na hora da apresentação
    if (confirm("Carregar Preset " + num + " e resetar votos?")) {
        db.collection('sessions').doc('current').update({
            sceneText: p.scene,
            options: {
                "1": p.opt1,
                "2": p.opt2,
                "3": p.opt3
            },
            votes: { "1": 0, "2": 0, "3": 0 }
        });
        alert("Cenário " + num + " ativado!");
    }
}