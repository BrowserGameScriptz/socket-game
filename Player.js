var Entity = require('./game/Entity.js').Entity;

var Player = function(param){
	var self = Entity.create(param);

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
		else if(self.pressingLeft && !self.pressingRight && !self.pressingUp && self.pressingDown && self.x > 10 && self.x < 20 && self.y < GAME_HEIGHT-20){
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
		else if(self.pressingLeft && !self.pressingRight && !self.pressingUp && self.pressingDown && self.x > 20 && self.y > GAME_HEIGHT-20 && self.y < GAME_HEIGHT-10){
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

module.exports = Player;