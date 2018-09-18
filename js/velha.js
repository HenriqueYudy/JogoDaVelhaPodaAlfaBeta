/* 
DIFICULDADE: 

FACIL: R-R-R-I-I
Normal: R-R-I-I-I
Dificil: R-I-I-I-I

LEGENDA: R=randomico
		 I=IA
*/

//BOT primeiro jogar = 1, 3 , 5, 7,  9
//BOT ultima jogar = 2, 4, 6 , 8


/* CONSTANTES */
var PLAYER_X = 'X',
	PLAYER_O = 'O',
	LINHA_TABULEIRO = 3,
	COLUNA_TABULEIRO = 3;

var padrãoBiGanho = [
	'111000000', '000111000', '000000111', // Linha
	'100100100', '010010010', '001001001', // Coluna
	'100010001', '001010100' // Diagonal
];

var padrãoDeGanho = {
	r1: '111000000',
	r2: '000111000',
	r3: '000000111', // Linha
	c1: '100100100',
	c2: '010010010',
	c3: '001001001', // Coluna
	d1: '100010001',
	d2: '001010100' // Diagonal
};

var padraoVerificacao = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8], // Linhas
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8], // Colunas
	[0, 4, 8],
	[2, 4, 6] // Diagonais
]


var seletores = {
	r1: ['#r0c0', '#r0c1', '#r0c2'],
	r2: ['#r1c0', '#r1c1', '#r1c2'],
	r3: ['#r2c0', '#r2c1', '#r2c2'],
	c1: ['#r0c0', '#r1c0', '#r2c0'],
	c2: ['#r0c1', '#r1c1', '#r2c1'],
	c3: ['#r0c2', '#r1c2', '#r2c2'],
	d1: ['#r0c0', '#r1c1', '#r2c2'],
	d2: ['#r2c0', '#r1c1', '#r0c2'],
};

/* Variaveis globais */
var board_count = 0,
	veronica_player = PLAYER_O,
	starting_player = 'me',
	tabuleiro,
	dificuldade = "",
	profundidade = 0;

function otherPlayer(player) {
	// verifica quem é o jogador 
	return (player === PLAYER_X) ? PLAYER_O : PLAYER_X;
}

var Board = function (newBoard, parent) {
	this._board = '';
	board_count++;
	this._id = board_count;
	this._parent = (parent !== undefined) ? parent.getID() : 0;


	// novo tabuleiro com 9 posição e criado
	// não pode conter espaços, X e nem O
	if (newBoard !== undefined &&
		newBoard.length === (LINHA_TABULEIRO * COLUNA_TABULEIRO) &&
		!/[^ XO]/g.test(newBoard)) {
		this._board = newBoard;
	} else {
		// é coloca nas posições do tabuleiro um espaço em branco
		this._board = ' '.repeat(9);
	}
	//console.log('New Board: "' + this._board + '"');
};


//Prototype do tabuleiro com funções para ajudar a pegar valores dentro da grid do jogo da velha 
// https://www.w3schools.com/js/js_object_prototypes.asp
Board.prototype = {
	getRC: function (row, col) {
		// console.log("ROW: "+ row + " COL: "+ col);
		// checa todas as conbinações possivels de x e o
		return this._board[row * 3 + col];
	},
	setRC: function (row, col, player) {

		var temp_bd = this._board.split('');
		temp_bd[row * 3 + col] = player;
		this._board = temp_bd.join('');

		// console.log("TEMP: "+temp_bd); // (sem tirar virgula)
		// console.log("Board : "+this._board) // metodo para obter todas as combinações possiveis (depois que tirar virgula)
	},
	getID: function () {
		//pega id do tabuleiro
		return this._id;

	},
	getOff: function (offset) {
		// console.log("getOFF: "+ this._board[offset])
		return this._board[offset];
	},
	play: function (move) {
		if (move === undefined) {
			console.log("Undefined");
		} else {
			this.setRC(move.row, move.col, move.player);
		}
	},
	openMoves: function (player) {
		var moves = [];

		// Se alguem ganhou o jogo para, porque não tem mais movimento
		if (this.winning(PLAYER_X) || this.winning(PLAYER_O)) {
			return [];
		}

		for (row = 0; row < LINHA_TABULEIRO; row++) {
			for (col = 0; col < COLUNA_TABULEIRO; col++) {
				if (this.getRC(row, col) === ' ') {
					moves.push(new Move(row, col, player));
					// console.log();
				}
			}
		}
		return moves;
	},
	toBin: function (player) {
		// converte o tabuleiro atual para binario 
		// os espaços em branco é convertido para 0
		// os espaços do jogador é convertido para 1
		// console.log("BINARIOS: " + parseInt(this._board.replace(new RegExp('[ ' + otherPlayer(player) + ']', 'g'),'0').
		// replace(new RegExp(player, 'g'),'1')
		// , 2));
		return parseInt(this._board.replace(new RegExp('[ ' + otherPlayer(player) + ']', 'g'), '0').replace(new RegExp(player, 'g'), '1'), 2);


	},
	winning: function (player) {
		var boardPattern = this.toBin(player);
		var result = padrãoBiGanho.reduce(function (acc, curr) {
			var winningPattern = parseInt(curr, 2);
			// console.log("Padrao de ganho :"+winningPattern); em decimal
			// Checa se o valor atual do jogo bate com o padrão de ganho
			if (((winningPattern & boardPattern) == winningPattern) > 0) {
				return acc + 1;
			} else {
				return acc;
			}
		}, 0);
		return (result > 0);
	},
	drawWinning: function (player) {



		var boardPattern = this.toBin(player);
		var success = [];
		Object.keys(padrãoDeGanho).forEach(function (curr) {
			var winningPattern = parseInt(padrãoDeGanho[curr], 2);
			// Checa se o valor atual do jogo bate com o padrão de ganho
			if (((winningPattern & boardPattern) == winningPattern) > 0) {
				success.push(curr);
			}
		});

		success.forEach(function (path_name) {
			$(seletores[path_name].join(',')).addClass('highlight');
		});
	},
	toHTML: function (highlight, score, player) {
		var output = '<div class="small_heir_container" id="hc' + this._id + '"><div class="small_board_container" id="bdc' + this._id + '"><table class="small_board">';
		for (row = 0; row < LINHA_TABULEIRO; row++) {
			output += '<tr class="row row' + row + '">';
			for (col = 0; col < COLUNA_TABULEIRO; col++) {
				var hl = (highlight !== undefined && highlight.row === row && highlight.col === col) ? ' highlight' : '';
				output += '<td class="cell ' + this.getRC(row, col) + hl + '">' + this.getRC(row, col) + '</td>';
			}
			output += '</tr>';
		}
		output += '</table>';
		if (score !== undefined) {
			output += '<span class="score">Score: ' + score + '</span>';
		}
		if (player !== undefined) {
			output += '<span class="player">Player: ' + player + '</span>';
		}
		output += '</div></div>';
		return output;
	},
	toStr: function () {
		//transforma em string
		var output = '';
		for (row = 0; row < LINHA_TABULEIRO; row++) {
			var thisRow = [];
			for (col = 0; col < COLUNA_TABULEIRO; col++) {
				thisRow.push(this.getRC(row, col));
			}
			output += thisRow.join('|') + "\n";
			output += (row < LINHA_TABULEIRO - 1) ? "-----\n" : '';
		}
		return output;
	},
	copy: function () {
		//Copia o tabuleiro atual
		return new Board(this._board, this);
	},
	isEmpty() {
		//Se for vazio retorna 9 posições vazias
		return this._board === '         ';
	},
	score: function () {
		//da nota para a jogada 
		var thisBd = this;
		return padraoVerificacao.reduce(function (score, pattern) {
			return score + thisBd.scoreLine(pattern);
		}, 0);
	},
	scoreLine: function (pattern) {
		// Verifica o padrao de ganho e da as notas para tabuleiro 
		var oppPlayer = otherPlayer(veronica_player);
		var score = 0;

		// Primeira Celula do padrao
		if (this.getOff(pattern[0]) === veronica_player) {
			score = 1;
		} else if (this.getOff(pattern[0]) === oppPlayer) {
			score = -1;
		}

		// Second cell
		if (this.getOff(pattern[1]) == veronica_player) {
			if (score == 1) { // cell1 is player
				score = 10;
			} else if (score == -1) { // cell1 is oppPlayer
				return 0;
			} else { // cell1 is empty
				score = 1;
			}
		} else if (this.getOff(pattern[1]) == oppPlayer) {
			if (score == -1) { // cell1 is oppPlayer
				score = -10;
			} else if (score == 1) { // cell1 is player
				return 0;
			} else { // cell1 is empty
				score = -1;
			}
		}

		// Third cell
		if (this.getOff(pattern[2]) == veronica_player) {
			if (score > 0) { // cell1 and/or cell2 is player
				score *= 10;
			} else if (score < 0) { // cell1 and/or cell2 is oppPlayer
				return 0;
			} else { // cell1 and cell2 are empty
				score = 1;
			}
		} else if (this.getOff(pattern[2]) == oppPlayer) {
			if (score < 0) { // cell1 and/or cell2 is oppPlayer
				score *= 10;
			} else if (score > 1) { // cell1 and/or cell2 is player
				return 0;
			} else { // cell1 and cell2 are empty
				score = -1;
			}
		}
		return score;
	}
};

var Move = function (row, col, player) {
	this.row = row;
	this.col = col;
	this.player = player;
}

Move.prototype = {
	sameAs: function (comp) {
		return (this.row === comp.row && this.col === comp.col);
	},
	cellID: function () {
		return '#r' + this.row + 'c' + this.col;
	}
};

// Implementation of the recursive "MiniMax" algorithim
// Code based on psudocode and eplanation found here:
// http://www.ntu.edu.sg/home/ehchua/programming/java/JavaGame_TicTacToe_AI.html
function miniMax(board, player, alpha, beta) {
	var moveList = board.openMoves(player);
	var melhorMovimento = undefined;

	if (moveList.length === 0) { // Game Over
		bestScore = board.score();
	} else {
		if (player === veronica_player) {
			for (var i = 0; i < moveList.length; i++) {
				var newBoard = board.copy();
				newBoard.play(moveList[i]);
				var score = miniMax(newBoard, otherPlayer(veronica_player), alpha, beta).score;
				if (score > alpha) {
					alpha = score;
					melhorMovimento = moveList[i];
				}
				if (alpha >= beta) {
					break;
				}
			}
			bestScore = alpha;
		} else {
			for (var i = 0; i < moveList.length; i++) {
				var newBoard = board.copy();
				newBoard.play(moveList[i]);
				var score = miniMax(newBoard, veronica_player, alpha, beta).score;
				if (score < beta) {
					beta = score;
					melhorMovimento = moveList[i];
				}
				if (alpha >= beta) {
					break;
				}
			}
			bestScore = beta;
		}
	}
	return {
		score: bestScore,
		move: melhorMovimento
	};
}

function veronicaMove() {
	var newMove;

	if (tabuleiro.isEmpty()) {
		// o primeiro movimento é randomico
		var row = Math.floor(Math.random() * 3);
		var col = Math.floor(Math.random() * 3);
		newMove = new Move(row, col, veronica_player);
		console.log("Randomico")

	} else if (dificuldade == 'facil') {
		if (profundidade <= 6) {

			console.log("jogo randomico")
			var row = Math.floor(Math.random() * 3);
			var col = Math.floor(Math.random() * 3);
			if (tabuleiro.getRC(row, col) === ' ') {
				newMove = new Move(row, col, veronica_player);
			}
			var row = Math.floor(Math.random() * 3);
			var col = Math.floor(Math.random() * 3);
			if (tabuleiro.getRC(row, col) === ' ') {
				newMove = new Move(row, col, veronica_player);
			} else {
				var row = Math.floor(Math.random() * 3);
				var col = Math.floor(Math.random() * 3);
				newMove = new Move(row, col, veronica_player);
			}

		} else {
			console.log("IA FACIL")
			newMove = miniMax(tabuleiro, veronica_player, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY).move;
		}
	} else if (dificuldade == 'normal') {
		console.log("Dificuldade: " + dificuldade);
		if (profundidade <= 3) {

			console.log("jogo randomico")
			var row = Math.floor(Math.random() * 3);
			var col = Math.floor(Math.random() * 3);
			if (tabuleiro.getRC(row, col) === ' ') {
				newMove = new Move(row, col, veronica_player);
			}
			var row = Math.floor(Math.random() * 3);
			var col = Math.floor(Math.random() * 3);
			if (tabuleiro.getRC(row, col) === ' ') {
				newMove = new Move(row, col, veronica_player);
			} else {
				var row = Math.floor(Math.random() * 3);
				var col = Math.floor(Math.random() * 3);
				newMove = new Move(row, col, veronica_player);
			}
		} else {
			console.log("IA NORMAL")
			newMove = miniMax(tabuleiro, veronica_player, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY).move;
		}
	} else if (dificuldade == 'dificil') {

		console.log("Dificuldade: " + dificuldade);
		if (profundidade <= 1) {
			console.log("jogo randomico")
			var row = Math.floor(Math.random() * 3);
			var col = Math.floor(Math.random() * 3);
			if (tabuleiro.getRC(row, col) === ' ') {
				newMove = new Move(row, col, veronica_player);
			}
			var row = Math.floor(Math.random() * 3);
			var col = Math.floor(Math.random() * 3);
			if (tabuleiro.getRC(row, col) === ' ') {
				newMove = new Move(row, col, veronica_player);
			} else {
				var row = Math.floor(Math.random() * 3);
				var col = Math.floor(Math.random() * 3);
				newMove = new Move(row, col, veronica_player);
			}
		} else {
			console.log("IA Dificil")
			newMove = miniMax(tabuleiro, veronica_player, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY).move;
		}
	} else if(dificuldade == 'impossivel	') {
		newMove = miniMax(tabuleiro, veronica_player, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY).move;
	}
	tabuleiro.play(newMove);
	//console.log(tabuleiro.toStr());
	$(newMove.cellID()).html(newMove.player).
	off('click', playerMove).
	removeClass('hoverEnable');;

	//Checa sem alguem ganhou
	if (tabuleiro.winning(veronica_player)) {
		tabuleiro.drawWinning(veronica_player);
		gameOver("Veronica Ganhou !!!");
	} else if (tabuleiro.openMoves().length === 0) {
		gameOver("Deu Velha !!!");
	}
	profundidade++;

}

function playerMove() {
	if ($(this).html() === '') {
		var row = parseInt($(this).attr('row'));
		var col = parseInt($(this).attr('col'));
		//Debuga;
		var newMove = new Move(row, col, otherPlayer(veronica_player));
		tabuleiro.play(newMove);
		//console.log(tabuleiro.toStr());
		$(newMove.cellID()).html(newMove.player).
		off('click', playerMove).
		removeClass('hoverEnable');

		if (tabuleiro.winning(otherPlayer(veronica_player))) {
			tabuleiro.drawWinning(otherPlayer(veronica_player));
			gameOver('Você ganhou !!!');
		} else if (tabuleiro.openMoves().length === 0) {
			gameOver("Deu Velha !!!");
		} else {
			veronicaMove();
		}
	}
	profundidade++;

}

// Metodo para executar quando for fim de jogo
function gameOver(text) {
	// Mostra o texto
	$('.announce').html(text).show();
	setTimeout(function () {
		$('.announce').addClass('tada');
	}, 100); // Delay needed to animate

	// disativa a função de clicar em cima da grid 
	$('.cell').off('click', playerMove).
	removeClass('hoverEnable');

	// Aparece o botao jogar dnv
	$('#start').html('Play Again').removeClass('btn-warning btn-success').addClass('btn-info');
}


$(document).ready(function () {
	// Pega o simbolos dos jogadores
	$(".symbol").change(function () {
		veronica_player = otherPlayer($(this).val());
	});

	// Pega o jogador que vai começar primeiro
	$(".choose_player").change(function () {
		starting_player = $(this).val();
	});

	$(".choose-dificulty").change(function () {
		dificuldade = $(this).val();
	});

	// escuta um click no botão de iniciar o jogo
	$('#start').click(function (e) {

		e.preventDefault();




		// Inicializa o jogo
		tabuleiro = new Board();
		$('.cell').html('');
		$('.cell').addClass('hoverEnable').removeClass('highlight');
		$('.announce').html('').removeClass('tada').hide();

		profundidade = 0;

		// escuta um click nas celulas da grid
		$('.cell').on('click', playerMove);

		//Quando iniciar o jogo remove o botao start e adiciona o reset
		$('#start').html('Reset').removeClass('btn-info btn-success').addClass('btn-warning');

		// se o jogodor que vai começar não e o humano o bot joga
		if (starting_player != 'me') {
			// veronica joga primeiro
			veronicaMove();
		}
	});
});