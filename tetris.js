
const cvs=document.getElementById('tetris');
const ctx=cvs.getContext('2d');
const scoree=document.getElementById('score');
const row = 25;
const col=column=15;
const sq = squaresize = 20;
const vacant = 'black';
//draw square
function drawsquare(x,y,color){
    ctx.fillStyle=color;
    ctx.fillRect(x*sq,y*sq,sq,sq);
    ctx.strokeStyle='black';
    ctx.strokeRect(x*sq,y*sq,sq,sq);
}

//draw board
let board=[];
for(r=0;r<row;r++){
    board[r]=[];
    for(c=0;c<col;c++){
        board[r][c]=vacant;
    }
}
//draw board
function drawboard(){
    for(r=0;r<row;r++){
        
        for(c=0;c<col;c++){
            drawsquare(c,r,board[r][c]);
        }
    }

}
drawboard();
//the pieces and their colors
const pieces=[
    [Z,'red'],
    [S,'green'],
    [T,'yellow'],
    [O,'blue'],
    [L,'purple'],
    [I,'cyan'],
    [J,'orange']
];

//initiate a random piece
function randompiece(){
    let r = Math.floor(Math.random()*pieces.length);//0-->6
    return new piece(pieces[r][0],pieces[r][1]);
}
let p= randompiece();

//the object piece
function piece(tetromino,color){
    this.tetromino=tetromino;
    this.color=color;
    this.tetrominoN=0;//we are taking the first configuration of the piece
    this.activetetromino=this.tetromino[this.tetrominoN];
    this.x=3;
    this.y=-2;

}

//fill function
piece.prototype.fill=function(color){
    for(r=0;r<this.activetetromino.length ;r++){
        
        for(c=0;c<this.activetetromino.length ;c++){
            if(this.activetetromino[r][c]){
                drawsquare(this.x+c,this.y+r,color);
            }
        }
    }

};

//draw a piece to the board

piece.prototype.draw=function(){
    this.fill(this.color);

};

//undraw a piece
piece.prototype.undraw=function(){
    this.fill(vacant);

};


//move down the piece
piece.prototype.movedown=function(){
    if(!this.collision(0,1,this.activetetromino)){
        this.undraw();
        this.y++;
        this.draw();
    }else{
        //we lock the piece and generate a new one
        this.lock();
        p= randompiece();
    }
    

};

//move right the piece
piece.prototype.moveright=function(){
    if(!this.collision(1,0,this.activetetromino)){
        this.undraw();
        this.x++;
        this.draw();

    }
    

};

//move left the piece
piece.prototype.moveleft=function(){
    if(!this.collision(-1,0,this.activetetromino)){
        this.undraw();
        this.x--;
        this.draw();

    }
    

};

//rotate the piece
piece.prototype.rotate=function(){
    let nextpattern=this.tetromino[(this.tetrominoN+1)%this.tetromino.length];
    let kick=0;
    if(this.collision(0,0,nextpattern)){
        if(this.x>col/2){
            //its the right wall
            kick=-1;//we nwwd to move the piece to the left
        }else{
            //its the left wall
            kick=1;//we need to move the piece to the right

        }
    }
    if(!this.collision(kick,0,nextpattern)){
        this.undraw();
        this.x+=kick;
        this.tetrominoN=(this.tetrominoN+1)%this.tetromino.length; //(0+2)%4=2
        this.activetetromino=this.tetromino[this.tetrominoN];
        this.draw();

    }
    

};

//locking the piece
let score=0;
piece.prototype.lock=function(){
    for(r=0;r<this.activetetromino.length ;r++){
        
        for(c=0;c<this.activetetromino.length ;c++){
            //we skip the vacant squares
            if(!this.activetetromino[r][c]){
                continue;
            }
            //pieces to lock on top=game over
            if(this.y+r<0){
                alert("GAME OVER");
                //stop request animation frame
                gameover=true;
                break;
            }
            //we lock the piece
            board[this.y+r][this.x+c]=this.color;

        }
    }
    //remove full rows
    for(r=0;r<row;r++){
        let isrowfull=true;
        for(c=0;c<col;c++){
            isrowfull=isrowfull && (board[r][c]!=vacant);
        }
        if(isrowfull){
            //if row is full we move down all the rows above it
            for(y=r;y>1;y--){
                for(c=0;c<col;c++){
                    board[y][c]=board[y-1][c];
                }
            }
            //the top row board[0][..] has no row above it
            for(c=0;c<col;c++){
                board[0][c]=vacant;
            }
            //increment the score
            score+=10;
        }
    }
    //update the board
    drawboard();
    //update the score
    scoree.innerHTML=score;
    
};

//collision function
piece.prototype.collision=function(x,y,piece){
    for(r=0;r<piece.length ;r++){
        
        for(c=0;c<piece.length ;c++){
            //if square is empty we skip it
            if(!piece[r][c]){
                continue;
            }
            //coordinates of piece after movement
            let newx=this.x + c + x;
            let newy=this.y + r + y;

            //conditions
            if(newx < 0 || newx >= col || newy >= row){
                return true;
            }
            //skip newy<0; board[-1] will crush our game
            if (newy < 0){
                continue;
            }
            //check if there is a locked piece already in place
            if(board[newy][newx] != vacant){
                return true;
            }
        }
    }
    return false;
};

// control the piece
document.addEventListener('keydown',control);
function control(event){
    if(event.keyCode==37){
        p.moveleft();
        dropstart=Date.now();
    }else if(event.keyCode==38){
        p.rotate();
        dropstart=Date.now();
    }else if(event.keyCode==39){
        p.moveright();
        dropstart=Date.now();
    }else if(event.keyCode==40){
        p.movedown();
        
    }
}

//drop the piece every second
let dropstart=Date.now();
let gameover=false;
function drop(){
    let now = Date.now();
    let delta = now-dropstart;
    if(delta>500){
        p.movedown();
        dropstart=Date.now();

    }
    if(!gameover){
        requestAnimationFrame(drop);
    }
    
}
drop();