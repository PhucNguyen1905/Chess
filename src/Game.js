import * as Chess from 'chess.js'
import { BehaviorSubject } from 'rxjs'
import audio from './assets/place.mp3'
import audio2 from './assets/place2.mp3'


const chess = new Chess()

const Audio1= new Audio(audio)
const Audio2= new Audio(audio2)

export const gameSubject = new BehaviorSubject()

export function initGame() {
    updateGame()
}

export function resetGame() {
    chess.reset()
    globalSum = 0;
    updateGame()
}

const playAudio = () => {
  Audio1.play()

}
const playAudio2 = () => {
  Audio2.play()
}

export function handleMove(from, to) {
    const promotions = chess.moves({ verbose: true }).filter(m => m.promotion)
    console.table(promotions)
    if (promotions.some(p => `${p.from}:${p.to}` === `${from}:${to}`)) {
        const pendingPromotion = { from, to, color: promotions[0].color }
        updateGame(pendingPromotion)
    }
    const { pendingPromotion } = gameSubject.getValue()

    if (!pendingPromotion) {
      playAudio()
      move(from, to)
    }
}


export function move(from, to, promotion) {
    let tempMove = { from, to }
    if (promotion) {
        tempMove.promotion = promotion
    }
    const legalMove = chess.move(tempMove)

    if (legalMove) {
        updateGame()
        window.setTimeout(()=>{
            handleAIPlayGame()
          },1)
    }
}

function updateGame(pendingPromotion) {
    const isGameOver = chess.game_over()

    const newGame = {
        board: chess.board(),
        pendingPromotion,
        isGameOver,
        turn: chess.turn(),
        result: isGameOver ? getGameResult() : null
    }


    gameSubject.next(newGame)
}

export default function handleAIPlayGame(){
    const isGameOver = chess.game_over()
    if(!!isGameOver) return
    makeBestMove('b')
    playAudio2()
    updateGame()
}

function getGameResult() {
    if (chess.in_checkmate()) {
        const winner = chess.turn() === "w" ? 'BLACK' : 'WHITE'
        return `CHECKMATE - WINNER - ${winner}`
    } else if (chess.in_draw()) {
        let reason = '50 - MOVES - RULE'
        if (chess.in_stalemate()) {
            reason = 'STALEMATE'
        } else if (chess.in_threefold_repetition()) {
            reason = 'REPETITION'
        } else if (chess.insufficient_material()) {
            reason = "INSUFFICIENT MATERIAL"
        }
        return `DRAW - ${reason}`
    } else {
        return 'UNKNOWN REASON'
    }
}


// AI using Minimax and alpha-beta

var globalSum = 0; // always from black's perspective. Negative for white's perspective.


var weights = { p: 100, n: 280, b: 320, r: 479, q: 929, k: 60000, k_e: 60000 };
var pst_w = {
  p: [
    [100, 100, 100, 100, 105, 100, 100, 100],
    [78, 83, 86, 73, 102, 82, 85, 90],
    [7, 29, 21, 44, 40, 31, 44, 7],
    [-17, 16, -2, 15, 14, 0, 15, -13],
    [-26, 3, 10, 9, 6, 1, 0, -23],
    [-22, 9, 5, -11, -10, -2, 3, -19],
    [-31, 8, -7, -37, -36, -14, 3, -31],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  n: [
    [-66, -53, -75, -75, -10, -55, -58, -70],
    [-3, -6, 100, -36, 4, 62, -4, -14],
    [10, 67, 1, 74, 73, 27, 62, -2],
    [24, 24, 45, 37, 33, 41, 25, 17],
    [-1, 5, 31, 21, 22, 35, 2, 0],
    [-18, 10, 13, 22, 18, 15, 11, -14],
    [-23, -15, 2, 0, 2, 0, -23, -20],
    [-74, -23, -26, -24, -19, -35, -22, -69],
  ],
  b: [
    [-59, -78, -82, -76, -23, -107, -37, -50],
    [-11, 20, 35, -42, -39, 31, 2, -22],
    [-9, 39, -32, 41, 52, -10, 28, -14],
    [25, 17, 20, 34, 26, 25, 15, 10],
    [13, 10, 17, 23, 17, 16, 0, 7],
    [14, 25, 24, 15, 8, 25, 20, 15],
    [19, 20, 11, 6, 7, 6, 20, 16],
    [-7, 2, -15, -12, -14, -15, -10, -10],
  ],
  r: [
    [35, 29, 33, 4, 37, 33, 56, 50],
    [55, 29, 56, 67, 55, 62, 34, 60],
    [19, 35, 28, 33, 45, 27, 25, 15],
    [0, 5, 16, 13, 18, -4, -9, -6],
    [-28, -35, -16, -21, -13, -29, -46, -30],
    [-42, -28, -42, -25, -25, -35, -26, -46],
    [-53, -38, -31, -26, -29, -43, -44, -53],
    [-30, -24, -18, 5, -2, -18, -31, -32],
  ],
  q: [
    [6, 1, -8, -104, 69, 24, 88, 26],
    [14, 32, 60, -10, 20, 76, 57, 24],
    [-2, 43, 32, 60, 72, 63, 43, 2],
    [1, -16, 22, 17, 25, 20, -13, -6],
    [-14, -15, -2, -5, -1, -10, -20, -22],
    [-30, -6, -13, -11, -16, -11, -16, -27],
    [-36, -18, 0, -19, -15, -15, -21, -38],
    [-39, -30, -31, -13, -31, -36, -34, -42],
  ],
  k: [
    [4, 54, 47, -99, -99, 60, 83, -62],
    [-32, 10, 55, 56, 56, 55, 10, 3],
    [-62, 12, -57, 44, -67, 28, 37, -31],
    [-55, 50, 11, -4, -19, 13, 0, -49],
    [-55, -43, -52, -28, -51, -47, -8, -50],
    [-47, -42, -43, -79, -64, -32, -29, -32],
    [-4, 3, -14, -50, -57, -18, 13, 4],
    [17, 30, -3, -14, 6, -1, 40, 18],
  ],

  // Endgame King Table
  k_e: [
    [-50, -40, -30, -20, -20, -30, -40, -50],
    [-30, -20, -10, 0, 0, -10, -20, -30],
    [-30, -10, 20, 30, 30, 20, -10, -30],
    [-30, -10, 30, 40, 40, 30, -10, -30],
    [-30, -10, 30, 40, 40, 30, -10, -30],
    [-30, -10, 20, 30, 30, 20, -10, -30],
    [-30, -30, 0, 0, 0, 0, -30, -30],
    [-50, -30, -30, -30, -30, -30, -30, -50],
  ],
};
var pst_b = {
  p: pst_w['p'].slice().reverse(),
  n: pst_w['n'].slice().reverse(),
  b: pst_w['b'].slice().reverse(),
  r: pst_w['r'].slice().reverse(),
  q: pst_w['q'].slice().reverse(),
  k: pst_w['k'].slice().reverse(),
  k_e: pst_w['k_e'].slice().reverse(),
};

var pstOpponent = { w: pst_b, b: pst_w };
var pstSelf = { w: pst_w, b: pst_b };

/*
 * Evaluates the board at this point in time,
 * using the material weights and piece square tables.
 */
function evaluateBoard(game, move, prevSum, color) {

    if (game.in_checkmate()) {
  
      // Opponent is in checkmate (good for us)
      if (move.color === color) {
        return 10 ** 10;
      }
      // Our king's in checkmate (bad for us)
      else {
        return -(10 ** 10);
      }
    }
  
    if (game.in_draw() || game.in_threefold_repetition() || game.in_stalemate())
    {
      return 0;
    }
  
    if (game.in_check()) {
      // Opponent is in check (good for us)
      if (move.color === color) {
        prevSum += 50;
      }
      // Our king's in check (bad for us)
      else {
        prevSum -= 50;
      }
    }
  
    var from = [
      8 - parseInt(move.from[1]),
      move.from.charCodeAt(0) - 'a'.charCodeAt(0),
    ];
    var to = [
      8 - parseInt(move.to[1]),
      move.to.charCodeAt(0) - 'a'.charCodeAt(0),
    ];
  
    // Change endgame behavior for kings
    if (prevSum < -1500) {
      if (move.piece === 'k') {
        move.piece = 'k_e';
      }

    }
  
    if ('captured' in move) {
      // Opponent piece was captured (good for us)
      if (move.color === color) {
        prevSum +=
          weights[move.captured] +
          pstOpponent[move.color][move.captured][to[0]][to[1]];
      }
      // Our piece was captured (bad for us)
      else {
        prevSum -=
          weights[move.captured] +
          pstSelf[move.color][move.captured][to[0]][to[1]];
      }
    }
  
    if (move.flags.includes('p')) {
      // NOTE: promote to queen for simplicity
      move.promotion = 'q';
  
      // Our piece was promoted (good for us)
      if (move.color === color) {
        prevSum -=
          weights[move.piece] + pstSelf[move.color][move.piece][from[0]][from[1]];
        prevSum +=
          weights[move.promotion] +
          pstSelf[move.color][move.promotion][to[0]][to[1]];
      }
      // Opponent piece was promoted (bad for us)
      else {
        prevSum +=
          weights[move.piece] + pstSelf[move.color][move.piece][from[0]][from[1]];
        prevSum -=
          weights[move.promotion] +
          pstSelf[move.color][move.promotion][to[0]][to[1]];
      }
    } else {
      // The moved piece still exists on the updated board, so we only need to update the position value
      if (move.color !== color) {
        prevSum += pstSelf[move.color][move.piece][from[0]][from[1]];
        prevSum -= pstSelf[move.color][move.piece][to[0]][to[1]];
      } else {
        prevSum -= pstSelf[move.color][move.piece][from[0]][from[1]];
        prevSum += pstSelf[move.color][move.piece][to[0]][to[1]];
      }
    }
  
    return prevSum;
  }

function minimax(game, depth, alpha, beta, isMaximizingPlayer, sum, color) {
    var children = game.moves({ verbose: true });
  
    // Sort moves randomly, so the same move isn't always picked on ties
    children.sort(function (a, b) {
      return 0.5 - Math.random();
    });
  
    var currMove;
    // Maximum depth exceeded or node is a terminal node (no children)
    if (depth === 0 || children.length === 0) {
      return [null, sum];
    }
  
    // Find maximum/minimum from list of 'children' (possible moves)
    var maxValue = Number.NEGATIVE_INFINITY;
    var minValue = Number.POSITIVE_INFINITY;
    var bestMove;
    for (var i = 0; i < children.length; i++) {
      currMove = children[i];
  
      var currPrettyMove = game.move(currMove);
      var newSum = evaluateBoard(game, currPrettyMove, sum, color);
      var [childBestMove, childValue] = minimax(
        game,
        depth - 1,
        alpha,
        beta,
        !isMaximizingPlayer,
        newSum,
        color
      );
  
      game.undo();
  
      if (isMaximizingPlayer) {
        if (childValue > maxValue) {
          maxValue = childValue;
          bestMove = currPrettyMove;
        }
        if (childValue > alpha) {
          alpha = childValue;
        }
      } else {
        if (childValue < minValue) {
          minValue = childValue;
          bestMove = currPrettyMove;
        }
        if (childValue < beta) {
          beta = childValue;
        }
      }
  
      // Alpha-beta pruning
      if (alpha >= beta) {
        break;
      }
    }
  
    if (isMaximizingPlayer) {
      return [bestMove, maxValue];
    } else {
      return [bestMove, minValue];
    }
  }
  
  /*
   * Calculates the best legal move for the given color.
   */
  function getBestMove(game, color, currSum) {
  
    var depth = parseInt(localStorage.getItem('difficulty'))
  
    var d = new Date().getTime();
    var [bestMove, bestMoveValue] = minimax(
      game,
      depth,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      true,
      currSum,
      color
    );
  
    return [bestMove, bestMoveValue];
  }
  
  /*
   * Makes the best legal move for the given color.
   */
  function makeBestMove(color) {
    if (color === 'b') {
      var move = getBestMove(chess, color, globalSum)[0];
    } else {
      var move = getBestMove(chess, color, -globalSum)[0];
    }
  
    globalSum = evaluateBoard(chess, move, globalSum, 'b');
  
    chess.move(move);
  }
  