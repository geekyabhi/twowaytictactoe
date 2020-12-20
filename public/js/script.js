const socket=io()
const X_CLASS='x'
const CIRCLE_CLASS='circle'
const WINNING_COMBINATION=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]


const cellElements=document.querySelectorAll('[data-cell]')
const board=document.getElementById('board')
const winningMessageTextElement=document.querySelector('[data-winning-message-text]')
const winningMessageElement=document.getElementById('winningMessage')
const restartButton=document.getElementById('restartButton')



// const $symbol=document.getElementById('symbol')
// const $symbolFormInput=$symbol.querySelector('input')
// const $symbolFormButton=$symbol.querySelector('button')


let circleTurn
let mySymbol
let username
let room

let query=Qs.parse(location.search,{ignoreQueryPrefix:true})

mySymbol=query.mySymbol
username=query.username
room=query.room

console.log(mySymbol,username,room)


if(mySymbol==='x'||mySymbol==='X')
    circleTurn=1
else if(mySymbol==='o'||mySymbol==='O')
    circleTurn=0

// startGame()


function startGame(){
    setBoardHoverClass(mySymbol)
    winningMessageElement.classList.remove('show')
}
// const current=circleTurn?CIRCLE_CLASS:X_CLASS
// const anticurrent=circleTurn?X_CLASS:CIRCLE_CLASS
let currentClass=X_CLASS


function handleClick(id,symbol){
    // console.log(symbol)
    if(symbol==='x'){
        currentClass=X_CLASS
    }
    else if(symbol==='o'){
        currentClass=CIRCLE_CLASS
    }
    const cell=document.getElementById(`${id}`)
    // console.log(cell)
    placeMark(cell,currentClass)
    if(checkWin(currentClass)){
        endGame(false,symbol)
    }else if(isDraw()){
        endGame(true,symbol)
    }else{        
        // swapTurns()
        setBoardHoverClass(mySymbol)
    }
}


function endGame(draw,symbol){
    if(draw){
        winningMessageTextElement.innerText='Draw !'
    }else{
        var winningmsz
        if(symbol===mySymbol)
            winningmsz="You won !"
        else
            winningmsz="You lose !"
        winningMessageTextElement.innerText=winningmsz
    }
    winningMessageElement.classList.add('show')
}


function isDraw(){
    return [...cellElements].every(cell=>{
        return cell.classList.contains(X_CLASS)||cell.classList.contains(CIRCLE_CLASS)
    })
}


function placeMark(cell,currentClass){
    if(circleTurn){
        cell.classList.add(currentClass)
        swapTurns()
    }
}


function swapTurns(){
    circleTurn=1-circleTurn
}


function setBoardHoverClass(symbol){
    // console.log(symbol)
    board.classList.remove(X_CLASS)
    board.classList.remove(CIRCLE_CLASS)
    if(symbol==='o'){
        board.classList.add(CIRCLE_CLASS)
    }else if(symbol==='x'){
        board.classList.add(X_CLASS)
    }
}


function checkWin(currentClass){
    return WINNING_COMBINATION.some(combination=>{
        return combination.every(index=>{
            return cellElements[index].classList.contains(currentClass)
        })
    })
}


document.getElementById('start__game').addEventListener('click',(e)=>{
    e.preventDefault()
    startGame()
    socket.emit('startgame','Game has started')
})


restartButton.addEventListener('click',(e)=>{
    e.preventDefault()
    cellElements.forEach(cell=>{
        cell.classList.remove(X_CLASS)
        cell.classList.remove(CIRCLE_CLASS)
        cell.removeEventListener('click',handleClick)
        cell.addEventListener('click',handleClick,{once:true})
    })
    winningMessageElement.classList.remove('show')
    socket.emit('restartgame','Game has started')
})


cellElements.forEach((cellBox)=>{
    cellBox.addEventListener('click',(e)=>{
        e.preventDefault()
        var id=e.target.id
        // console.log(id,mySymbol)
        // console.log(mySymbol)
        if(circleTurn)
        handleClick(id,mySymbol)
        socket.emit('handleclick',{id,mySymbol})
    })
})


socket.on('startgamemessage',(msz)=>{
    startGame()
})


socket.on('restartgamemessage',(msz)=>{
    cellElements.forEach(cell=>{
        cell.classList.remove(X_CLASS)
        cell.classList.remove(CIRCLE_CLASS)
        // cell.removeEventListener('click',handleClick)
        // cell.addEventListener('click',handleClick,{once:true})
    })
    winningMessageElement.classList.remove('show')
    if(mySymbol==='x')
        circleTurn=1
    else if(mySymbol==='o')
        circleTurn=0
})


socket.on('handleclickmessage',(data)=>{
    var id=data.id
    var sym=data.mySymbol
    // console.log(mySymbol)
    swapTurns()  
    handleClick(id,sym)
    swapTurns()
})


var centremessagebox=document.querySelector('.centered-message')
var buttontoexit=document.querySelector('.centered-message button')
var label=document.querySelector('.centered-message label')

buttontoexit.addEventListener('click',(e)=>{
    e.preventDefault()
    centremessagebox.style.display='none'
})


socket.emit('join',{mySymbol,username,room},(error)=>{
    if(error){
        centremessagebox.style.display='flex'
        console.log(error)
        label.innerHTML=`${error}`
        location.href='/'
    }
})

socket.on('message',(data)=>{
    centremessagebox.style.display='flex'
    console.log(data)
    label.innerHTML=`${data}`
})

