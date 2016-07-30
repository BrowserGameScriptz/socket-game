var socket = require('socket.io');
var express = require('express');
var http = require('http');

var app = express();
var serv = http.createServer(app);

var io = socket.listen(serv);

var SOCKET_LIST = {};
var PORT = 8001;

var DEBUG = true;
var GAME_WIDTH = 1000;
var GAME_HEIGHT = 1000;
var playerCollisionRadiusX = 55;
var playerCollisionRadiusY = 30;

serv.listen(PORT);
console.log("Server started.");

var Entity = function(param){
	var self = {
		x:50,
		y:50,
		spdX:0,
		spdY:0,
		id:"",
	}
	if(param){
		if(param.x)
			self.x = param.x;
		if(param.y)
			self.y = param.y;
		if(param.id)
			self.id = param.id;
	}

	self.update = function(){
		self.updatePosition();
	}
	self.updatePosition = function(){
		if(!self.affectedByBoundaries){
			self.x += self.spdX;
			self.y += self.spdY;
		}
	}
	self.getDistance = function(player){
		return Math.sqrt(Math.pow(self.x-player.x,2) + Math.pow(self.y-player.y,2));
	}
	self.collidingWith = function(player){
		var mouseAngleRadians = player.mouseAngle * (Math.PI / 180);
		var collisionCenterX = (Math.cos(mouseAngleRadians) * (playerCollisionRadiusX-20)) + player.x;
		var collisionCenterY = (Math.sin(mouseAngleRadians) * (playerCollisionRadiusX-20)) + player.y;

		var collisionFactor = Math.pow(Math.cos(mouseAngleRadians) * (self.x - collisionCenterX) + Math.sin(mouseAngleRadians) * (self.y - collisionCenterY), 2) / Math.pow(playerCollisionRadiusX, 2) + Math.pow(Math.sin(mouseAngleRadians) * (self.x - collisionCenterX) - Math.cos(mouseAngleRadians) * (self.y - collisionCenterY), 2) / Math.pow(playerCollisionRadiusY, 2);

		if(collisionFactor <= 1){
			return true;
		}
		return false;
	}
	return self;
}

var Player = function(param){
	var self = Entity(param);

	self.number = "" + Math.floor(10*Math.random());
	self.pressingRight = false;
	self.pressingLeft = false;
	self.pressingUp = false;
	self.pressingDown = false;
	self.pressingAttack = false;
	self.mouseAngle = 0;
	self.windowWidth = 0;
	self.windowHeight = 0;
	self.maxSpd = 10;
	self.affectedByBoundaries = true;
	self.hp = 10;
	self.beingHit = false;
	self.shooting = false;
	self.reloading = false;
	self.hpMax = 10;
	self.numberOfBullets = 8;
	self.maxBullets = 8;
	self.kills = 0;
	self.deaths = 0;

	var super_update = self.update;
	self.update = function(){
		self.updateSpd();
		super_update();
		if(self.pressingAttack && !self.shooting && !self.reloading){
			if(self.numberOfBullets > 0){
				self.shooting = true;
				self.shootBullet(self.mouseAngle);
				self.numberOfBullets--;
				setTimeout(function(){
					self.shooting = false;
				}, 160);
			}
			else{
				self.reloading = true;
				setTimeout(function(){
					self.numberOfBullets = self.maxBullets;
					self.reloading = false;
				}, 2000);
			}
		}
	}
	self.shootBullet = function(angle){
		var b = Bullet({
			parent: self.id, 
			angle: angle,
			x: self.x,
			y: self.y,
		});
	}

	self.updateSpd = function(){
		if(self.pressingLeft && !self.pressingRight && !self.pressingUp && !self.pressingDown && self.x > 20){
			self.spdX = -self.maxSpd;
			self.spdY = 0;
		}
		else if(!self.pressingLeft && self.pressingRight && !self.pressingUp && !self.pressingDown && self.x < GAME_WIDTH-20){
			self.spdX = self.maxSpd;
			self.spdY = 0;
		}
		else if(!self.pressingLeft && !self.pressingRight && self.pressingUp && !self.pressingDown && self.y > 20){
			self.spdX = 0;
			self.spdY = -self.maxSpd;
		}
		else if(!self.pressingLeft && !self.pressingRight && !self.pressingUp && self.pressingDown && self.y < GAME_HEIGHT-20){
			self.spdX = 0;
			self.spdY = self.maxSpd;
		}
		else if(self.pressingLeft && !self.pressingRight && self.pressingUp && !self.pressingDown && self.x > 20 && self.y > 20){
			self.spdX = (0.71*-self.maxSpd);
			self.spdY = (0.71*-self.maxSpd);
		}
		else if(self.pressingLeft && !self.pressingRight && !self.pressingUp && self.pressingDown && self.x > 20 && self.y < GAME_HEIGHT-20){
			self.spdX = (0.71*-self.maxSpd);
			self.spdY = (0.71*self.maxSpd);
		}
		else if(!self.pressingLeft && self.pressingRight && self.pressingUp && !self.pressingDown && self.x < GAME_WIDTH-20 && self.y > 20){
			self.spdX = (0.71*self.maxSpd);
			self.spdY = (0.71*-self.maxSpd);
		}
		else if(!self.pressingLeft && self.pressingRight && !self.pressingUp && self.pressingDown && self.x < GAME_WIDTH-20 && self.y < GAME_HEIGHT-20){
			self.spdX = (0.71*self.maxSpd);
			self.spdY = (0.71*self.maxSpd);
		}
		else if(self.pressingLeft && !self.pressingRight && self.pressingUp && !self.pressingDown && self.x > 10 && self.x < 20 && self.y > 20){
			self.spdX = 0;
			self.spdY = -self.maxSpd;
		}
		else if(self.pressingLeft && !self.pressingRight && !self.pressingUp && self.pressingDown && self.x > 10 && self.x < 20 && self.y < GAME_HEIGHT-10){
			self.spdX = 0;
			self.spdY = self.maxSpd;
		}
		else if(!self.pressingLeft && self.pressingRight && self.pressingUp && !self.pressingDown && self.x > GAME_WIDTH-20 && self.x < GAME_WIDTH-10 && self.y > 20){
			self.spdX = 0;
			self.spdY = -self.maxSpd;
		}
		else if(!self.pressingLeft && self.pressingRight && !self.pressingUp && self.pressingDown && self.x > GAME_WIDTH-20 && self.x < GAME_WIDTH-10 && self.y < GAME_HEIGHT-20){
			self.spdX = 0;
			self.spdY = self.maxSpd;
		}

		else if(self.pressingLeft && !self.pressingRight && self.pressingUp && !self.pressingDown && self.x > 20 && self.y > 10 && self.y < 20){
			self.spdX = -self.maxSpd;
			self.spdY = 0;
		}
		else if(self.pressingLeft && !self.pressingRight && !self.pressingUp && self.pressingDown && self.x > 10 && self.y > GAME_HEIGHT-20 && self.y < GAME_HEIGHT-10){
			self.spdX = -self.maxSpd;
			self.spdY = 0;
		}
		else if(!self.pressingLeft && self.pressingRight && self.pressingUp && !self.pressingDown && self.x < GAME_WIDTH-20 && self.y > 10 && self.y < 20){
			self.spdX = self.maxSpd;
			self.spdY = 0;
		}
		else if(!self.pressingLeft && self.pressingRight && !self.pressingUp && self.pressingDown && self.x < GAME_WIDTH-20 && self.y > GAME_HEIGHT-20 && self.y < GAME_HEIGHT-10){
			self.spdX = self.maxSpd;
			self.spdY = 0;
		}
		else{
			self.spdY = 0;
			self.spdX = 0;
		}
	}

	self.updatePosition = function(){
		self.x += self.spdX;
		self.y += self.spdY;
	}

	self.respawn = function(){
		self.hp = self.hpMax;
		self.x = Math.random() * GAME_WIDTH;
		self.y = Math.random() * GAME_HEIGHT;
	}

	self.recordKill = function(){
		self.kills += 1;
	}

	self.recordDeath = function(){
		self.deaths += 1;
	}

	self.getInitPack = function(){
		return {
			id: self.id,
			x: self.x,
			y: self.y,
			mouseAngle: self.mouseAngle,
			pressingAttack: self.pressingAttack,
			number: self.number,
			hp:self.hp,
			hpMax:self.hpMax,
			kills:self.kills,
			deaths:self.deaths,
			numberOfBullets:self.numberOfBullets,
			maxBullets:self.maxBullets,
		};
	}
	self.getUpdatePack = function(){
		return {
			id: self.id,
			x: self.x,
			y: self.y,
			mouseAngle: self.mouseAngle,
			pressingAttack: self.pressingAttack,
			hp:self.hp,
			beingHit:self.beingHit,
			kills:self.kills,
			deaths:self.deaths,
			hpMax:self.hpMax,
			numberOfBullets:self.numberOfBullets,
			reloading:self.reloading,
		};
	}

	Player.list[self.id] = self;
	initPack.player.push(self.getInitPack());
	return self;
}
Player.list = {};
Player.onConnect = function(socket){
	var player = Player({
		id: socket.id
	});
	socket.on('keyPress', function(data){
		if(data.inputId === 'left')
			player.pressingLeft = data.state;
		else if(data.inputId === 'right')
			player.pressingRight = data.state;
		else if(data.inputId === 'up')
			player.pressingUp = data.state;
		else if(data.inputId === 'down')
			player.pressingDown = data.state;
		else if(data.inputId === 'attack')
			player.pressingAttack = data.state;
		else if(data.inputId === 'mouseAngle')
			player.mouseAngle = data.state;
	});
	socket.on('loseFocus', function(){
		player.pressingLeft = false;
		player.pressingRight = false;
		player.pressingUp = false;
		player.pressingDown = false;
		player.pressingAttack = false;
	});

	socket.emit('init', {
		selfId:socket.id,
		player:Player.getAllInitPack(),
		bullet:Bullet.getAllInitPack(),
	});
}

Player.getAllInitPack = function(){
	var players = [];
	for(var i in Player.list)
		players.push(Player.list[i].getInitPack());
	return players;
}

Player.onDisconnect = function(socket){
	delete Player.list[socket.id];
	removePack.player.push(socket.id);
}

Player.update = function(){
	var pack = [];
	for(var i in Player.list){
		var player = Player.list[i];
		player.update();
		pack.push(player.getUpdatePack());
	}
	return pack;
}

Player.resetOneTickOnlyVariables = function(){
	for(var i in Player.list){
		var player = Player.list[i];
		player.beingHit = false;
	}
}

var Bullet = function(param){
	var self = Entity(param);
	self.id = Math.random();
	self.angle = param.angle;
	self.diameter = 2;
	self.spdX = Math.cos(param.angle/180*Math.PI) * 40;
	self.spdY = Math.sin(param.angle/180*Math.PI) * 40;
	self.affectedByBoundaries = false;
	self.parent = param.parent;

	self.liveTimer = 0;
	self.deathTimer = 0;
	self.toRemove = false;
	var super_update = self.update;
	self.update = function(){
		if(self.liveTimer++ > 15)
			self.toRemove = true;
		super_update();

		for(var i in Player.list){
			var player = Player.list[i];
			if(self.collidingWith(player) && self.parent !== player.id){
				self.toRemove = true;
				player.hp -= 1;
				player.beingHit = true;
				if(player.hp <= 0){
					var shooter = Player.list[self.parent];
					if(shooter)
						shooter.recordKill();
					player.recordDeath();
					player.respawn();
				}
			}
		}
	}
	self.getInitPack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			diameter:self.diameter,
		};
	}
	self.getUpdatePack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			angle:self.angle,
			deathTimer:self.deathTimer,
			diameter:self.diameter,
		};
	}
	Bullet.list[self.id] = self;
	initPack.bullet.push(self.getInitPack());
	return self;
}
Bullet.list = {};

Bullet.update = function(){
	var pack = [];
	for(var i in Bullet.list){
		var bullet = Bullet.list[i];
		if(bullet.toRemove){
			if(bullet.deathTimer < 5){
				bullet.deathTimer++;
			}
			else{
				delete Bullet.list[i];
				removePack.bullet.push(bullet.id);
			}
		}
		pack.push(bullet.getUpdatePack());
		bullet.update();
	}
	return pack;
}

Bullet.getAllInitPack = function(){
	var bullets = [];
	for(var i in Bullet.list)
		bullets.push(Bullet.list[i].getInitPack());
	return bullets;
}

io.sockets.on('connection', function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;

	Player.onConnect(socket);
	socket.on('disconnect', function(){
		delete SOCKET_LIST[socket.id];
		Player.onDisconnect(socket);
	});
	socket.on('sendMsgToServer', function(data){
		var playerName = ("" + socket.id).slice(2,7);
		for(var i in SOCKET_LIST){
			SOCKET_LIST[i].emit('addToChat', playerName + ': ' + data);
		}
	});
	socket.on('evalServer', function(data){
		if(!DEBUG)
			return;
		var res = eval(data);
		socket.emit('evalAnswer', res);
	});
});

var initPack = {player:[], bullet:[]};
var removePack = {player:[], bullet:[]};

setInterval(function(){
	//Bullet has to be updated ahead of player as player reactions depend upon bullet collisions
	var pack = {
		bullet:Bullet.update(),
		player:Player.update(),
	}

	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('init', initPack);
		socket.emit('update', pack);
		socket.emit('remove', removePack);
	}
	initPack.player = [];
	initPack.bullet = [];
	removePack.player = [];
	removePack.bullet = [];

	Player.resetOneTickOnlyVariables();

}, 40)

