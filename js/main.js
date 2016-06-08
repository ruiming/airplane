$(function() {
	if(localStorage["name"] != undefined){
		config.name = localStorage["name"];
	}
	else {
		config.name = "渣渣";
	}
	if(localStorage["result"] != undefined){
		result = JSON.parse(localStorage["result"]);
	}
	else{
		var temp = {
			name: "Ruiming",
			score: "9999999000",
			time: new Date().toLocaleString()
		};
		result.push(temp);
		localStorage["result"] = JSON.stringify(result);
	}

	var before = $("<li><span>名字</span><span>分数</span><span>时间</span></li>");
	list.prepend(before);
	$.each(result,function(n, one){
		var text =  $("<li></li>");
		$.each(one, function(key, value){
			text.append("<span>" + value + "</span>");
		});
		list.append(text);
	});
	startScreen.draw();

});

var result = [];
var list = $("<ul></ul>");

// 界面
var game = $("#box");

// 配置和参数
var config = {

	resource: [
		"images/resource/gift_more_bullet.png"
	],

	name: "渣渣",

	type: [
		"images/enemy/F15.png",
		"images/enemy/F16.png",
		"images/enemy/F35.png"
	],

	warcraft: {
		hp: 3,
		type: "images/J-10/J-10.png"
	},

	timer: {
		bullet: null,
		enemy: null
	},

	// 子弹速度900，子弹延迟150，敌机速度在9000到9500之间，敌机产生间距700
	mode: [null, 900, 150, 9000, 9500, 700, 1000],

	num: {
		count: 0,
		warcraftX: 0,
		warcraftY: 0,
		score: 0,
		hp: 3
	}

};

// 进入游戏
var startScreen = {
	draw: function() {
		var title = $("<div>");
		title.addClass("title");
		title.html("飞机大战");
		game.append(title);

		game.append(list);

		var difficulty;

		if(localStorage["name"] != undefined){
			difficulty = $("<div class='difficulty'><a href='javascript:void(0)'>开始游戏</a></div>");
		}
		else {
			difficulty = $("<div class='difficulty'><span>请输入您的大名</span><input type='text'><a href='javascript:void(0)'>开始游戏</a></div>");
		}

		game.append(difficulty);

		game.find($(".difficulty")).delegate("a", "click", function(e) {
			config.name = $(".difficulty input").val();
			if(config.name == "" || config.name == undefined) {
				config.name = "渣渣";
			}
			startScreen.remove();

			core.warcraft([400,700]);	// 战机初始位置

			var down = [];

			$(document).keydown(function(e){
				down[e.keyCode] = true;
				var x = Math.abs(parseInt($(".warcraft").css("left")));
				var y = Math.abs(parseInt($(".warcraft").css("top")));
				if(down[87]){
					y-=20;
				}
				if(down[83]){
					y+=20;
				}
				if(down[65]){
					x-=50;
				}
				if(down[68]){
					x+=50;
				}
				core.warcraft([x,y]);
			}).keyup(function(e){
				down[e.keyCode] = false;
			});


			var set = config.mode;
			config.modetxt = $(this).html();
			core.draw();

			// 敌机速度随时间加快,每1s加快一次
			var fast = setInterval(function(){
				if(set[3] >= 4000){
					set[3] -= 10;
					set[4] -= 10;
				}
				else{
					clearInterval(fast);
				}
			}, 1000);


			// 战机子弹发射事件
			config.timer.bullet = setInterval(function() {
				core.bullet(set[1], [config.num.warcraftX, config.num.warcraftY]);
			}, set[2]);

			// 敌机生成事件
			config.timer.enemy = setInterval(function() {
				core.enemy({
					speed: randomNum(set[3], set[4]),
					left: randomNum(0, 577),
					top: -randomNum(30, 80),
					type: randomNum(1, 3),
					gift: randomNum(1, 100)
				})
			}, set[5])
		})
	},
	remove: function() {
		var DIV = game.children($("div"));
		setTimeout(function() {
			DIV.remove();
		}, 300)
	}
};

// 核心事件
var core = {
	// 开始游戏
	draw: function() {
		var warcraft = $("<div class='warcraft'><img src='" + config.warcraft.type + "'></div>");
		game.append(warcraft);

		var hp = $("<div class='hp'></div>");
		hp.html("生命值: " + config.warcraft.hp);
		game.append(hp);

		var score = $("<div class='score'>0</div>");
		game.append(score);
	},
	// 战机位置
	warcraft: function(pos) {
		var warcraft = game.find($(".warcraft")),
			left = pos[0],
			top = pos[1];

		if(left <= -warcraft.width()/2){
			left = -warcraft.width()/2 + 5;
		}
		else if(left >= game.width() - warcraft.width()/2){
			left = game.width() - warcraft.width()/2 - 5;
		}

		if(top <= 0){
			top = 0;
		}
		else if(top >= game.height() - warcraft.height()){
			top = game.height() - warcraft.height();
		}

		warcraft.css({
			left: left,
			top: top
		});

		config.num.warcraftX = left + warcraft.width()/2;
		config.num.warcraftY = top + warcraft.height()/2;
	},
	// 战机生命值
	hp: function(hp) {
		var HP = $(".hp");
		HP.html("生命值:" + hp);
	},
	// 战机子弹
	bullet: function(speed, pos) {
		var bullet = $("<div class='bullet'></div>");
		game.append(bullet);

		bullet.css({
			left: pos[0] - bullet.width()/2,
			top: pos[1] - bullet.height()/2
		});

		bullet.stop().animate(
			{top: -bullet.height()},
			speed,
			function(){
				bullet.remove();
			}
		)
	},
	// 敌机生成
	enemy: function(argument) {
		var speed = argument.speed,
			left = argument.left,
			top = argument.top,
			type = argument.type,
			gift = argument.type;

		var oEnemy = $("<div class='enemy'><img style='width:30px' src='" + config.type[type] + "'</div>");
			oEnemy.css({
				left: left,
				top: top
			});

			oEnemy.appendTo(game);
			oEnemy.stop().animate(
				{top: 1000},
				speed,
				function(){
					oEnemy.remove();
					clearInterval(oEnemy.timer);
				}
			);

		// 敌机子弹事件
		oEnemy.bulletTimer = setInterval(function() {
			var x = parseInt(oEnemy.css("left")) + 6,
				y = parseInt(oEnemy.css("top")) + 15;


			var enemyBullet = $("<div class='enemyBullet'></div>");

			enemyBullet.css({
				left: x - enemyBullet.width()/2 + 5,
				top: y + enemyBullet.height()*2
			});

			game.append(enemyBullet);
			enemyBullet.stop().animate(
				{top: 3000},
				speed/2.5,
				function() {
					enemyBullet.remove();
					clearInterval(oEnemy.bulletTimer);
				}
			)
		}, 1400);

		// 碰撞检测
		oEnemy.timer = setInterval(function() {
			var x = parseInt(oEnemy.css("left")) + 12,
				y = parseInt(oEnemy.css("top")) + 15,
				l = $(".bullet").length,
				k = $(".enemyBullet").length;

			// 敌机与我方子弹触碰
			for(var i=0; i<l; i++){
				var bx = Math.abs( x - parseInt($(".bullet").eq(i).css("left"))),
					by = Math.abs( y - parseInt($(".bullet").eq(i).css("top")));

				if(bx <= 14 && by <= 20) {
					// 掉礼物
					if(argument.gift%50 == 2){
						setTimeout(function() {
							oEnemy.children('img').attr("src", config.resource[0]);
						}, 300);
					}
					else {
						oEnemy.css("background", "url('img/boom.png')");
						setTimeout(function() {
							oEnemy.remove();
						}, 300);
					}
					$(".bullet").eq(i).remove();
					clearInterval(oEnemy.bulletTimer);
					clearInterval(oEnemy.timer);
					config.num.score++;
					game.find($(".score")).html(config.num.score*1000);
				}
			}

			// 我方与敌机子弹碰撞
			for(var d=0; d<k; d++) {
				var bx2 = Math.abs(parseInt($(".warcraft").css("left")) - parseInt($(".enemyBullet").eq(d).css("left")) + 12),
					by2 = Math.abs(parseInt($(".warcraft").css("top")) - parseInt($(".enemyBullet").eq(d).css("top")) + 15);

				if(bx2 <= 14 && by2 <= 20) {
					config.warcraft.hp--;
					core.hp(config.warcraft.hp);
					if(config.warcraft.hp <= 0) {
						core.GameOver();
					}
					else {
						$(".enemyBullet").eq(d).remove();
						$(".warcraft").css("background", "url('img/boom2.png')");
						setTimeout(function() {
							$(".warcraft").css("background", "");
						}, 1000);
					}
				}
			}

			// 我方与敌机碰撞
			var bx3 = Math.abs(x - parseInt($(".warcraft").css("left")) - 30),
				by3 = Math.abs(y - parseInt($(".warcraft").css("top")) - 18);
			if(bx3 <= 40 && by3 <= 33) {
				config.warcraft.hp--;
				core.hp(config.warcraft.hp);

				oEnemy.css("background", "url('img/boom.png')");
				setTimeout(function() {
					oEnemy.remove();
				}, 300);

				clearInterval(oEnemy.bulletTimer);
				clearInterval(oEnemy.timer);

				if(config.warcraft.hp <= 0) {
					core.GameOver();
				}
				else {
					$(".warcraft").css("background", "url('img/boom2.png')");
					setTimeout(function() {
						$(".warcraft").css("background", "");
					}, 1000);
				}
			}
		});
	},
	GameOver: function(){

		$(".hp").remove();
		$(".warcraft").remove();
		var tips = $("<div class='tips'></div>");
		tips.html("<span>Game Over</span><span>分数:" + $(".score").html() + "</span><p>重来</p>");
		setTimeout(function() {
			game.append(tips);
		}, 3000);

		var temp = {
			name: config.name,
			score: $(".score").html(),
			time: new Date().toLocaleString()
		};
		result.push(temp);
		list.append("<li><span>" + temp.name + "</span><span>" + temp.score + "</span><span>" + temp.time + "</span></li>");
		localStorage["result"] = JSON.stringify(result);
		localStorage["name"] = config.name;
		$(".score").css("display", "none");
		$(".warcraft").css("background", "url('img/boom2.png')");

		game.delegate(".tips p", "click", function() {
			config.num.score = 0;
			config.warcraft.hp = 3;
			startScreen.remove();
			startScreen.draw();
		});

		clearInterval(config.timer.bullet);
		clearInterval(config.timer.enemy);
	}
};
var randomNum = function(a, b){
	var value = Math.abs(a-b), num;
	return parseInt(Math.random()*value) + Math.min(a,b);
};