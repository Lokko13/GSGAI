// Global variables!
var currentMove;    // current index of movement direction
var hasMoved;                   // checks whether you have already moved
var path;                  // list containing movements that were path
var move;   			// for switch case, helps decide moves [left, right, up, down] - Keem
var enemyArea;				//Location indexes of areas affected by enemies? - Beng
var hazards;				//Location index of hazards? -Beng
var direct = [[0,-1],[0,1],[-1,0],[1,0]];  // Possible moves [Left, Right, Down, Up] - Beng (coordinates ata to ng next tile according to next move so direction nga talaga - Keem)
var cur;					//Bots current position - Beng
var prev;					//What was bots previos move - Beng  
var next;   				//Planned next move? from direct -Beng
var enemyPos;           	//Location index of areas of enemies - Beng
var go;
var delay;  
var done;
var process; // the current decision of the bot

// This function is called before the start of each round. Use it to initialize your
// bots intelligence!
function initAI (player,enemies,maplayout,end)
{

		go=0;
		delay =random(4,11); // Why random?
		process=0;		//Does 0 mean no decision? or no decision yet? -Beng
		done = false
		enemyArea=new Array(enemies.length); //counts enemies and prepares and array for its area of influence -Beng
		
		//This loops creates an array of tiles  "occupied" by the enemy for each enemy -Beng
		for(var i=0; i<enemyArea.length; i++) 
			enemyArea[i]=new Array();
			
		cur=[player.getX(), player.getY()]; // x,y coordinate on map - Keem
		prev = [-1,-1];		//Moved from? undefined -1,-1? -Beng
		hasMoved = true;	//true to stop it from randombly moving at the beggining? - Beng
		currentMove=0;		// waley pa! -Beng

// Base functions



// This function is run during the game loop repeatedly.
function THINK(player,enemies,maplayout,end)
{		
		if(process>50){ //Why 50? - Well, Beng. Di ko rin alam pero ang alam ko ay: too low=thinks less/di mahanap yung tamang path, too high=daming isip, waley kilos
				//50 iterations given time to think - Beng
			if(go>delay){
				//delay is the time it can think in 1 iteration of process. IT IS RANDOM ATM - Beng [not sure]
				//this if statement "memorizes" the enemy area
				if(done){//when "memorizing is done it goes to thinking
					hazards=genHazards(enemies, enemyArea);
					Thinking(player, enemies, maplayout, end);
				}
			}
			else
				go++;
		}
		else{
				enemyArea = getEnemyArea(enemies, enemyArea);
				process++
		}
}


function Thinking(player, enemies, maplayout, end){

        cur = [player.getX(), player.getY()]; // gets current coordinate
        if ((cur[0]!=prev[0]||cur[1]!=prev[1])){ // checks to see if the bot has moved
				
				var h = computeH(cur,[end.getX(), end.getY()]); // sends current and end coordinates, retrieves distance between them
				var n = new tile(cur, [-1, -1], h, 0, h); 
				path = pathFind(n, [end.getX(), end.getY()], maplayout);
                move = path[currentMove];
				
				next = [cur[0]+direct[move][0], cur[1]+direct[move][1]]; // coordinates of next move
				
				if(isHazardous(next)){
					for(var i=0; i<direct.length; i++){
						next = [cur[0]+direct[i][0], cur[1]+direct[i][1]];
						if(!isHazardous(next)&&maplayout[next[0]][next[1]]!=3){
							move = i;
							break;
						}
					}
				}
				
				switch(move){ // do your decided move
					case 0: hasMoved = player.MoveUp(); break;
					case 1: hasMoved = player.MoveDown(); break;
					case 2: hasMoved = player.MoveLeft(); break;
					case 3: hasMoved = player.MoveRight(); break;
        		}
				prev = cur;
				
        }


}

function getEnemyArea(enemies, area){
	var eLight;
	var list;
	var temp;
	var x, y, f;
	done = true;
	for(var i=0; i<enemies.length; i++){
		
		x = enemies[i].getX();
		y = enemies[i].getY();
		f = enemies[i].getFacing();
		if(!inArea(area[i],[x, y, f])){
			
			eLight = new Array();
			temp = new Array();
			eLight.push([x,y]);
			eLight.push(f);
			list = enemies[i].Light.ListofArray;
			for(var j=0; j<list.length; j++)
				temp.push([list[j].x, list[j].y]);
			eLight.push(temp);
			area[i].push(eLight);
		}
		
	}
	return area;
}

function inArea(area, place){
	var cur, f;
	for(var i=0; i<area.length; i++){
		cur = area[i][0];
		f = area[i][1];
		if(cur[0]==place[0]&&cur[1]==place[1]&&f==place[2])
			return true;
	}
	return false;
}

function tile(coord, parent, h, g, f){
	this.coord=coord;
	this.parent=parent;
	this.h=h;
	this.g=g;
	this.f=f;
	
	this.getCoord = function(){
		return this.coord;
	}
	
	this.getParent = function(){
		return this.parent;
	}
	
	this.getH = function(){
		return this.h;
	}
	
	this.getG = function(){
		return this.g;
	}
	
	this.getF = function(){
		return this.f;
	}
	
	this.setParent = function(newP){
		this.parent=newP;
	}
	
	this.setH = function(newH){
		this.h=newH;
	}
	
	this.setG = function(newG){
		this.g=newG;
	}
	
	this.setF = function(newF){
		this.f=newF;
	}
}

function genHazards(enemies, enemyArea){
	var enemy;
	var area;
	var loc;
	var hazards=new Array();
	enemyPos = new Array();
	for(var h=0; h<enemies.length; h++){
		enemy=[enemies[h].getX(),enemies[h].getY(),enemies[h].getFacing()];
		for(var i=0; i<enemyArea.length;i++){
			area=enemyArea[i];
			for(var j=0; j<area.length; j++){
				loc=area[j][0];
				if(loc[0]==enemy[0]&&loc[1]==enemy[1]&&area[j][1]==enemy[2]){
					enemyPos.push(j);
					hazards.push(area[(j)%area.length][2]);
					hazards.push(area[(j+1)%area.length][2]);
					break;
				}
			}
		}
	}
	return hazards;
}

function computeG(parent, child){
	if(isHazardous(child))
		return parent.getG()+1000;
	else
		return parent.getG()+10;
}

function computeH(point, end){ //computes for distance between current position and the end's location
	return (Math.abs(point[0]-end[0])+Math.abs(point[1]-end[1]))*10;
}

function computeF(g, h){
	return g+h;
}

function arrange(open){
	var temp;
	
	for(var i=0; i<open.length-1; i++){
		for(var j=open.length-1; j>i; j--){
			if(open[i].getF()>open[j].getF()){
				temp = open[j];
				open[j] = open[i];
				open[i] = temp;
			}
		}
	}
	
	return open;
}

function inClosed(point, closed){
	var cur;
	for(var i=0; i<closed.length; i++){
		cur = closed[i].getCoord();
		if(cur[0]==point[0]&&cur[1]==point[1])
			return true;
	}
	return false;
}

function inOpen(point, open){
	var cur;
	for(var i=0; i<open.length; i++){
		cur = open[i].getCoord();
		if(cur[0]==point[0]&&cur[1]==point[1])
			return true;
	}
	return false;
}

function checkChange(parent, point, g, open){
	var cur;
	for(var i=0; i<open.length; i++){
		cur = open[i].getCoord();
		if(cur[0]==point[0]&&cur[1]==point[1])
			if(g<open[i].getG()){
				open[i].setParent(parent);
				open[i].setG(g);
				open[i].setF(open[i].getH()+open[i].getG());
				break;
			}
	}
	return open;
}

function reverse(path){
	var rPath = new Array();
	for(var i=path.length-1; i>=0; i--)
		rPath.push(path[i]);
	
	return rPath;
}


function isHazardous(player){
	var pX=player[0];
	var pY=player[1];
	var area;
	for(var i=0; i<hazards.length; i++){
		area=hazards[i];
		for(var j=0; j<area.length; j++){
			if(area[j][0]==pX&&area[j][1]==pY)
				return true;
		}
	}
	return false;

}

function genPath(closed, start, end){
	var cur=end;
	var prev;
	var done=false;
	var i;
	var path = new Array();
	while(!done){
		for(i=0; i<closed.length; i++){
			prev=closed[i].getCoord();
			if(cur[0]==prev[0]&&cur[1]==prev[1])
				break;
		}
		prev=closed[i].getParent();
		if(cur[0]<prev[0])
			path.push(2);		
		else if(cur[0]>prev[0])
			path.push(3);
		else if(cur[1]<prev[1])
			path.push(0);
		else if(cur[1]>prev[1])
			path.push(1);
		
		cur = prev;
		if(cur[0]==start[0]&&cur[1]==start[1])
				done=true;
	}
	return reverse(path);
}

function pathFind(start, end, maplayout){
	var open = new Array();
	var closed = new Array();
	var connected = new Array();
	var found = false;
	var curPos;
	var next;
	var h, g;
	var count=0;
	open.push(start);
	
	while(!found&&open.length>0){
		open = arrange(open);
		curPos = open[0].getCoord();
		
		for(var i=0; i<direct.length; i++){
			next=new Array();
			next.push(curPos[0]+direct[i][0]);
			next.push(curPos[1]+direct[i][1]);
			
			h = computeH(next, end);
			g = computeG(open[0], next);
			
			if(next[0]<0||next[1]<0||next[0]>=20||next[1]>=20){}
			else if(maplayout[next[0]][next[1]]==3||inClosed(next,closed)){}
			else if(inOpen(next, open)){
				open = checkChange(curPos, next, g, open);
			}
			else{
				open.push(new tile(next, curPos, h, g, g+h));
			}
			if(next[0]==end[0]&&next[1]==end[1]){
				closed.push(open[open.length-1]);
				open.splice(open.length-1,1);
				found = true;
				break;
			}

		}	
		closed.push(open[0]);
		open.splice(0, 1);
	}
	return genPath(closed, start.getCoord(), end);
}

// Other functions 

function random(start,end)
{
    return Math.floor((Math.random()*end)+start);
}

function endAI(win)
{


}

