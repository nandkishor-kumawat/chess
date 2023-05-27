let board = document.getElementById("board")
const pcs = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
let player = 'white';
let selectedPiece = '';
let hasPiece = false;
let check = false;
let suggestion = true;
let checkMoves = [];
let historyMoves = [];
let moveNumber = 0;
let checker = null;
let whiteCaptured = [];
let blackCaptured = [];
let captured = [];
let promotion = {
    state: false,
    pieces: ['queen', 'bishop', 'knight', 'rook'],
    promote: null
}

localStorage.removeItem('historyMoves');


function setupBoard() {
    board.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let div = document.createElement('div');
            div.setAttribute('piece', '');
            div.classList.add('box');
            div.id = `box-${i}-${j}`;

            div.classList.add(((i + j) % 2 === 0) ? 'light' : 'dark');

            if (i === 0 || i === 7) {
                div.setAttribute('piece', `${i === 0 ? 'black' : 'white'}-${pcs[j]}`);
                div.classList.add('placed');
            }
            if (i === 1 || i === 6) {
                div.setAttribute('piece', `${i === 1 ? 'black' : 'white'}-pawn`);
                div.classList.add('placed');
            }
            board.appendChild(div);
        }
    }
} setupBoard();


// document.querySelectorAll('.box').forEach(box => {
//     box.onclick = async () => {
//         if (box.classList.contains('selected')) {
//             removeSelection();
//             return
//         }

//         if (!selectedPiece) {
//             if (box.getAttribute('piece').indexOf(player) >= 0) {
//                 // if (check) findCheckMoves(box);
//                 // else selectPiece(box);
//                 selectPiece(box);
//                 return
//             }
//         }

//         if (selectedPiece) {
//             let a = selectedPiece.getAttribute('piece').split('-');
//             let color = a[0];
//             let type = a[1];

//             if (box.getAttribute('piece').indexOf(color) >= 0) {
//                 removeSelection();
//                 selectPiece(box);
//                 return;
//             }

//             let ask = isKingInCheck(box);
//             // console.log(ask);

//             // let apr = new Promise((resolve, reject) => {
//             //     setTimeout(() => {
//             //         console.log('first');
//             //         resolve();
//             //     }, 2000);
//             // });

//             // await apr;

//             // return;
//             if (!ask && box.classList.contains('legal')) {
//                 if (isPromoting(box, color, type)) await promote(box, color, type);
//                 setPiece(box, color, type);
//                 // addCheckClass();
//                 switchPlayer();
//                 isCheck(box.id);
//                 let move = {
//                     pre: {
//                         id: selectedPiece.id,
//                         piece: isPromoting(box, color, type) ? promotion.promote : selectedPiece.getAttribute('piece')
//                     },
//                     curr: {
//                         id: box.id,
//                         piece: box.getAttribute('piece')
//                     }
//                 }
//                 if (moveNumber === historyMoves.length) {
//                     historyMoves.push(move);
//                 } else {
//                     historyMoves[moveNumber] = move;
//                 }
//                 moveNumber++;
//                 localStorage.setItem('historyMoves', JSON.stringify(historyMoves));
//                 delPiece();
//                 addCaptured(move.curr);
//                 checkWinning();
//                 removeSuggestion();
//             }
//         }
//     }
// });


document.querySelectorAll('.box').forEach(box => {
    box.onclick = async () => {

        if (box.classList.contains('selected')) {
            removeSelection();
            return;
        }

        if (box.getAttribute('piece').indexOf(player) >= 0) {
            // if (check) findLegalMovesInCheck(box);
            // else selectPiece(box);
            if (selectedPiece) removeSelection();
            selectPiece(box);
            return;
        }

        if (!selectedPiece) return;

        let a = selectedPiece.getAttribute('piece').split('-');
        let color = a[0];
        let type = a[1];


        // let ask = isKingInCheck(box);


        // if (!ask && box.classList.contains('legal')) {
        if (box.classList.contains('legal')) {
            if (isPromoting(box, color, type)) await promote(box, color, type);

            let move = {
                pre: {
                    id: selectedPiece.id,
                    piece: selectedPiece.getAttribute('piece')
                },
                curr: {
                    id: box.id,
                    piece: box.getAttribute('piece')
                }
            }

            if (moveNumber === historyMoves.length) {
                historyMoves.push(move);
            } else {
                historyMoves[moveNumber] = move;
            }

            moveNumber++;
            localStorage.setItem('historyMoves', JSON.stringify(historyMoves));

            setPiece(box, color, type);
            // addCheckClass();
            switchPlayer();
            isCheck(box.id);
            delPiece();
            addCaptured(move.curr);
            checkWinning();
            removeSuggestion();
        }
    }
});


$('#undo').onclick = () => {
    if (moveNumber === 0) return
    moveNumber--;

    let move = historyMoves[moveNumber]
    let pre = move.pre;
    setPiece($('#' + pre.id), pre.piece.split('-')[0], pre.piece.split('-')[1])

    let current = move.curr;
    if (current.piece === '') {
        let box = $('#' + current.id);
        box.setAttribute('piece', '');
        box.classList.remove('placed');

    } else {
        setPiece($('#' + current.id), current.piece.split('-')[0], current.piece.split('-')[1]);
    }

    // removeSuggestion()
    switchPlayer();
    if (selectedPiece) removeSelection();
    // console.log(historyMoves, moveNumber);
    localStorage.setItem('historyMoves', JSON.stringify(historyMoves));
}


$('#redo').onclick = () => {
    if (moveNumber === historyMoves.length) return;

    let move = historyMoves[moveNumber];

    let pre = move.pre;

    selectedPiece = $('#' + pre.id);
    let current = move.curr;

    setPiece($('#' + current.id), pre.piece.split('-')[0], pre.piece.split('-')[1]);
    delPiece();
    switchPlayer();
    if (selectedPiece) removeSelection();
    moveNumber++;
    // console.log(historyMoves, moveNumber);
    localStorage.setItem('historyMoves', JSON.stringify(historyMoves));
}


function checkWinning() {
    if (!$('[piece=' + player + '-king]')) {
        setTimeout(() => {
            alert(`${player === 'white' ? 'black' : 'white'} has won`);
        }, 1000);
    }
}


function addCheckClass() {
    document.querySelectorAll('.box').forEach(box => box.classList.remove('check'));
    let allPieces = document.querySelectorAll(`[piece^=${player === 'white' ? 'black' : 'white'}]`);

    Array.from(allPieces).forEach(piece => {
        const nextMoves = getMoves(piece);
        for (let move of nextMoves) {
            let box = $('#box-' + move[0] + '-' + move[1]);
            box.classList.add('check');
        }
    });
}


function isKingInCheck(box) {
    document.querySelectorAll('.box').forEach(ele => ele.classList.remove('check'));
    let hasPlaced = false;
    let selectRemove = false;
    let isKing = {
        placeRemoved: false,
        attr: null,
        sudoattr: false,

    };


    let king = $(`[piece = ${player}-king]`);
    let kingPos = getPos(king.id);
    let opponentMoves = [];


    if ((selectedPiece.id === king.id)) {
        if (box.classList.contains('placed')) {
            box.classList.remove('placed');
            isKing.placeRemoved = true;
            isKing.attr = box.getAttribute('piece');
            box.setAttribute('piece', player + '-' + player);
        } else {
            // attr = box.getAttribute('piece');
            box.setAttribute('piece', player + '-' + player);
            isKing.sudoattr = true;
        }
    } else {
        if (box.classList.contains('placed')) hasPlaced = true;
        box.classList.add('placed');
    }
    selectedPiece.classList.remove('placed');
    selectRemove = true;


    let nextChecker = [];

    let allPieces = Array.from(document.querySelectorAll(`[piece^=${player === 'white' ? 'black' : 'white'}]`));

    // console.log(allPieces)

    Array.from(allPieces).forEach(piece => {
        try {
            const pieceMoves = getMoves(piece, true);
            // console.log(JSON.stringify(pieceMoves), piece);
            opponentMoves = [...opponentMoves, ...pieceMoves];

            if (JSON.stringify(pieceMoves).includes(JSON.stringify(kingPos))) nextChecker.push(piece);
        } catch (e) {
            console.log(piece);
        }
    });

    // opponentMoves = [...new Set(opponentMoves.map(JSON.stringify))].map(JSON.parse);

    opponentMoves.forEach(([i, j]) => $('#box' + '-' + i + '-' + j).classList.add('check'));

    // console.log(JSON.stringify(opponentMoves));

    // for (let piece of hasMoves) {
    //     let pieceMoves = getMoves(piece);
    //     let king = $(`[piece = ${player}-king]`);
    //     let kingPos = getPos(king.id);

    //     isPresent = JSON.stringify(pieceMoves).includes(JSON.stringify(kingPos));
    //     if (isPresent) {
    //         break;
    //     }
    // }

    let isPresent = JSON.stringify(opponentMoves).includes(JSON.stringify(kingPos));

    // if (isKing) {
    //     box.classList.add('placed');
    //     box.setAttribute('piece', attr);
    // }
    // document.querySelectorAll('.box').forEach(ele => ele.classList.remove('check'));
    if (!hasPlaced) {
        box.classList.remove('placed');
    };

    if (selectRemove) selectedPiece.classList.add('placed');

    if ((selectedPiece.id === king.id)) {
        // console.log('selectedPiece.id===king.id');
        if (isKing.placeRemoved) {
            box.classList.add('placed');
            box.setAttribute('piece', isKing.attr);
            // console.log("isKing.placeRemoved");
        }
        else if (isKing.sudoattr) {
            box.setAttribute('piece', '');
            // console.log("isKing.sudoattr");
        }
        return box.classList.contains('check');
    };

    if (check && (box.id === checker.id)) {
        // console.log('check && (box.id === checker.id)');
        return false;
    };


    for (const piece of nextChecker) {
        // console.log("const piece of nextChecker", piece);
        if (piece.id === box.id) return false;
    }

    return isPresent;
}


function findLegalMovesInCheck(box) {
    let a = box.getAttribute('piece').split('-');
    let color = a[0];
    let type = a[1];

    let [i, j] = getPos(box.id);

    // console.log(box);
    // console.log(getMoves(box));

    // let allPieces = document.querySelectorAll(`[piece^=${player}]`);
    // let hasMoves = Array.from(allPieces).filter(box => getMoves(box).length > 0)

    // for (const piece of hasMoves) {
    //     let checkerMoves = getMoves(checker);
    //     let pieceMoves = getMoves(piece);

    //     console.log(pieceMoves,checkerMoves);
    // }

    if (box.getAttribute('piece').includes('king')) {
        // console.log('king');
        return;
    }

    let checkerMoves = getMoves(checker);
    let pieceMoves = getMoves(box);
    let legalCheckMoves = [];
    let checkerPos = getPos(checker.id);

    const isCapturing = JSON.stringify(pieceMoves).includes(JSON.stringify(checkerPos));
    if (isCapturing) legalCheckMoves.push(checkerPos);

    for (const move of pieceMoves) {
        const present = JSON.stringify(checkerMoves).includes(JSON.stringify(move));
        if (present) legalCheckMoves.push(move);
    }
    // console.log(legalCheckMoves);
    findLegalMoves(legalCheckMoves);
    // console.log(JSON.stringify(pieceMoves), JSON.stringify(checkerMoves));
}


function getPos(id) {
    let b = id.split('-');
    let i = parseInt(b[1]);
    let j = parseInt(b[2]);
    return [i, j];
}


function isCheck(id) {

    let moves = getMoves($('#' + id));
    // console.log(JSON.stringify(moves));
    let king = $(`[piece = ${player}-king]`);
    let kingPos = getPos(king.id);

    check = JSON.stringify(moves).includes(JSON.stringify(kingPos));

    if (check) {
        // king.classList.add('error');
        checker = $('#' + id);
    }


}


function selectPiece(box) {
    box.classList.add('selected');
    selectedPiece = box;
    // check ? findLegalMovesInCheck(box) : findLegalMoves(getMoves(selectedPiece));
    // findLegalMoves(getMoves(selectedPiece));
    let legalmoves = [];
    let moves = getMoves(selectedPiece);

    for (const [i, j] of moves) {
        let bx = $('#box-' + i + '-' + j);
        if (!isKingInCheck(bx)) legalmoves.push([i, j]);
    }
    // console.log(legalmoves);
    findLegalMoves(legalmoves);
}


function removeSelection() {
    selectedPiece.classList.remove('selected');
    selectedPiece = '';
    removeSuggestion();
}


function removeSuggestion() {
    document.querySelectorAll('.box').forEach(e => {
        e.classList.remove('legal');
        e.classList.remove('show');
    });
}


function isPromoting(box, color, type) {
    if (type !== 'pawn') return false;
    let row = getPos(box.id)[0];
    if ((color === 'white' && row === 0)) return true;
    if ((color === 'black' && row === 7)) return true;
    return false;
}


function promote(box, color, type) {
    return new Promise((resolve, reject) => {
        board.style.opacity = 0.3;
        let promo = $('#promotion');
        promo.style.display = 'block';
        for (const p of promotion.pieces) {
            let div = document.createElement('div');
            div.setAttribute('piece', color + '-' + p);
            div.addEventListener('click', () => {
                promotion.promote = color + '-' + p;
                resolve();
                promo.innerHTML = '';
                promo.style.display = 'none';
                board.style.removeProperty('opacity');
            });
            promo.appendChild(div);
        }
    })
}


function setPiece(box, color, type) {
    box.setAttribute('piece', isPromoting(box, color, type) ? promotion.promote : `${color}-${type}`);
    box.classList.add('placed');
}


function delPiece() {
    selectedPiece.setAttribute('piece', '');
    selectedPiece.classList.remove('placed');
    selectedPiece.classList.remove('selected');
    selectedPiece = '';
}


function addCaptured(cap) {
    if (!cap.piece) return
    // captured[player] = [...captured[player], cap];
    captured = [...captured, cap];
    // updatePiece();
    // console.log(captured);
}


function updatePiece() {
    // Object.entries(captured).forEach(([key,value]) => {
    //     console.log(key,value);
    // })
    $(`#whiteCaptured`).innerHTML = '';
    $(`#blackCaptured`).innerHTML = '';
    captured.forEach(box => {
        let color = box.piece.split('-')[0];
        $(`#${color}Captured`).innerHTML += `<div piece=${box.piece} class="box" pid=${box.id}></div>`;
    });
}


function findLegalMoves(nextMoves) {
    for (let move of nextMoves) {
        let box = $('#box-' + move[0] + '-' + move[1]);
        box.classList.add('legal');
        if (suggestion) box.classList.add('show');
    }
}


function getMoves(box = selectedPiece, dia) {
    let a = box.getAttribute('piece').split('-');
    // console.log(box.getAttribute('piece'))
    let color = a[0];
    let type = a[1];

    let b = box.id.split('-');
    let i = parseInt(b[1]);
    let j = parseInt(b[2]);

    let nextMoves = [];
    let moves;
    switch (type) {
        case 'pawn':
            if (color === 'black') {
                moves = [
                    [1, 0], [2, 0], [1, -1], [1, 1]
                ];
            } else {
                moves = [
                    [-1, 0], [-2, 0], [-1, 1], [-1, -1]
                ];
            }
            nextMoves = getPawnMoves(i, j, color, moves, dia);
            break;
        case 'rook':
            moves = [
                [0, 1], [0, -1], [1, 0], [-1, 0]

            ];
            nextMoves = getQueenMoves(i, j, color, moves);
            break;
        case 'knight':
            moves = [
                [-1, -2], [-2, -1], [1, -2], [-2, 1],
                [2, -1], [-1, 2], [2, 1], [1, 2]
            ];
            nextMoves = getKnightMoves(i, j, color, moves);
            break;
        case 'bishop':
            moves = [
                [1, 1], [1, -1], [-1, 1], [-1, -1]
            ];
            nextMoves = getQueenMoves(i, j, color, moves);
            break;
        case 'queen':
            moves = [
                [1, 1], [1, -1], [-1, 1], [-1, -1], [0, 1], [0, -1], [1, 0], [-1, 0]
            ];
            nextMoves = getQueenMoves(i, j, color, moves);
            break;
        case 'king':
            moves = [
                [1, 1], [1, -1], [-1, 1], [-1, -1],
                [0, 1], [0, -1], [1, 0], [-1, 0]
            ];
            nextMoves = getKingMoves(i, j, color, moves);
            break;
        default:
            break;
    }

    return nextMoves;
}


function getPawnMoves(i, j, color, moves, dia = false) {
    let nextMoves = [];
    for (let index = 0; index < moves.length; index++) {
        let I = i + moves[index][0];
        let J = j + moves[index][1];
        if (!outOfBounds(I, J)) {
            let box = $('#box-' + I + '-' + J);
            if (index === 0 && !dia) {
                if (!box.classList.contains('placed')) {
                    nextMoves.push([I, J]);
                } else {
                    index++;
                }
            } else if (index === 1 && !dia) {
                if (((color === 'black' && i === 1) || (color === 'white' && i === 6)) && !box.classList.contains('placed')) {
                    nextMoves.push([I, J]);
                }
            } else if (index > 1) {
                // if (box.getAttribute('piece') !== '' && box.getAttribute('piece').indexOf(color) < 0) {
                //     nextMoves.push([I, J]);
                // }
                if ((box.classList.contains('placed') && box.getAttribute('piece').indexOf(color) < 0) || dia) {
                    nextMoves.push([I, J]);
                }
            }
        }
    }
    return nextMoves;
}


function getQueenMoves(i, j, color, moves) {
    let nextMoves = [];
    for (let move of moves) {
        let I = i + move[0];
        let J = j + move[1];
        let sugg = true;
        while (sugg && !outOfBounds(I, J)) {
            let box = $('#box-' + I + '-' + J);
            if (box.classList.contains('placed')) {
                if (box.getAttribute('piece').indexOf(color) >= 0) {
                    sugg = false;
                } else {
                    nextMoves.push([I, J]);
                    sugg = false;
                }
            }
            if (sugg) {
                nextMoves.push([I, J]);
                I += move[0];
                J += move[1];
            }
        }
    }
    return nextMoves;
}


function getKnightMoves(i, j, color, moves) {
    let nextMoves = [];
    for (let move of moves) {
        let I = i + move[0];
        let J = j + move[1];
        if (!outOfBounds(I, J)) {
            let box = $('#box-' + I + '-' + J);
            if (!box.classList.contains('placed') || box.getAttribute('piece').indexOf(color) < 0) {
                nextMoves.push([I, J]);
            }
        }
    }
    return nextMoves;
}


function getKingMoves(i, j, color, moves) {
    let nextMoves = [];
    for (let move of moves) {
        let I = i + move[0];
        let J = j + move[1];
        if (!outOfBounds(I, J)) {
            let box = $('#box-' + I + '-' + J);
            if (!box.classList.contains('placed') && !box.classList.contains('check') || box.getAttribute('piece').indexOf(color) < 0) {
                nextMoves.push([I, J]);
            }
        }
    }
    return nextMoves;
}


function outOfBounds(i, j) {
    return (i < 0 || i >= 8 || j < 0 || j >= 8);
}


$('#suggest').onchange = () => {
    suggestion = suggestion ? false : true;
    document.querySelectorAll('.legal').forEach(e => {
        // suggestion ? e.classList.add('show') : e.classList.remove('show')
        e.classList.toggle('show');
    });
}



function switchPlayer() {
    player = player === 'white' ? 'black' : 'white';
    // if (player === 'white') {
    //     player = 'black';
    // }
    // else {
    //     player = 'white'
    // }
    $('#currentPlayer').className = player;
}


function $(c) {
    return document.querySelector(c);
}
