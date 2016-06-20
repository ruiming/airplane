"use strict";
$(() => {
	// localStorage设置
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
		let temp = {
			name: "Ruiming",
			score: "9999999000",
			time: new Date().toLocaleString()
		};
		result.push(temp);
		localStorage["result"] = JSON.stringify(result);
	}

	// 战绩设置
	setList();

	// 绘制屏幕
	startScreen.draw();
});

let result = [];
let list = null;
let game = $("#box");
// 全局变量和配置
let config = {
	// 资源/补给品
	resource: [
		"images/resource/gift_more_bullet.png",
		"images/resource/gift_more_bullet.png",
		"images/resource/gift_more_bullet.png",
		"images/resource/gift_more_boom.png",
		"images/resource/gift_Invincible.png",
		"images/resource/gift_more_power.png",
		"images/resource/gift_more_health.png",
		"images/resource/gift_more_power.png",
		"images/resource/gift_more_bullet.png",
		"images/resource/gift_more_bullet.png"
	],
	// 默认名
	name: "渣渣",
	// 敌机图片
	type: [
		"images/enemy/F15.png",		// 0
		"images/enemy/F15.png",		// 1
		"images/enemy/F15.png",		// 2
		"images/enemy/F15.png",     // 3
		"images/enemy/F16.png",		// 4
		"images/enemy/F16.png",		// 5
		"images/enemy/F35.png",     // 6
		"images/enemy/J-10.png",    // 7
		"images/enemy/J-10.png",	// 8
		"images/enemy/J-31.png",	// 9
		"images/enemy/J-31.png",	// 10
		"images/enemy/T50.png",		// 11
        "images/enemy/F15.png",     // 12
        "images/enemy/F15.png",     // 13
        "images/enemy/J-10.png",    // 14
        "images/enemy/J-10.png",    // 15
        "images/enemy/J-10.png",    // 16
        "images/enemy/F16.png",     // 17
        "images/enemy/F35.png",     // 18
        "images/enemy/F35.png"      // 19
	],
	// 战机配置
	Air: {
		hp: 3,								// 战机生命值
		type: "images/J-20/J-20.png",		// 战机类型
		boom: false,						// 是否发射导弹
		invincible: 0,						// 是否无敌状态
		powerLimit: 0,						// 免费高速子弹时间
		bulletType: 0,						// 子弹类型
        level: 1							// 等级
	},
	// 游戏必须的三个计数器
	timer: {
		bullet: null,						// 战机子弹计时器
		enemy: null,						// 敌机产生计时器
        levelup: null						// 战机生产计时器
	},
	// 子弹速度900，子弹延迟150，敌机速度在9000到9500之间，敌机产生间距750
	mode: [null, 900, 150, 6500, 7500, 730, 1000],
	// 其他参数
	num: {
		count: 0,
		bullet: 1500,
		AirX: 0,
		AirY: 0,
		score: 0,
		interval: 5,
		boom: 3,
		giftSpeed: 4000,
        enemybulletlimit: 0
	}
};

// 绘制屏幕
let startScreen = {
	draw: () => {
		let title = $("<div>");
			title.addClass("title");
			title.html("飞机大战");
		game.append(title);

        let help = $("<div>");
            help.addClass("help");
            help.html("ctrl键发射炮弹，space键发射导弹.<br/> Made by Ruiming");
        game.append(help);

		game.append(list);

		let difficulty = $("<div class='difficulty'><span>请输入您的大名</span><input type='text'><a href='javascript:void(0)'>开始游戏</a></div>");
		game.append(difficulty);

		// 开始游戏
		game.find($(".difficulty")).delegate("a", "click", e => {
			config.name = $(".difficulty input").val();
			if(config.name == "" || config.name == undefined) {
				config.name = "渣渣";
			}
			startScreen.remove();

			// 战机跟踪鼠标
			$(document).mousemove(e => {
				let x = e.clientX - game.offset().left;
				let y = e.clientY - game.offset().top;
				core.Air([x,y]);
			});
			let down = [];
			let up = 1;

			// 监控键盘
			$(document).keydown(e => {
				down[e.keyCode] = true;
				// 发射子弹
				if(down[17]  && config.num.bullet > 0 && config.Air.hp > 0) {	// ctrl
					if(up % config.num.interval == 1){
						core.bullet(set[1], [config.num.AirX, config.num.AirY]);
					}
					up ++;
				}
				// 发射导弹
				if(down[32] && config.num.boom > 0) {
					core.boom();
				}
			}).keyup(e => {
				down[e.keyCode] = false;
				up = 1;
			});

			let set = config.mode;
			config.modetxt = $(this).html();
			core.draw();

			// 敌机产生频率加快
			let fast = setInterval(() => {
				if(config.num.enemybulletlimit < 500){
                    config.num.enemybulletlimit += 5;
				}
				else{
					clearInterval(fast);
				}
			}, 10000);

			// 敌机生成事件
			config.timer.enemy = setInterval(() => {
				core.enemy({
					speed: randomNum(set[3], set[4]),
					left: randomNum(10, 570),
					top: -randomNum(30, 80),
					type: randomNum(0, 20),
					gift: randomNum(0, 100)
				})
			}, set[5]);

            // 升级
            config.timer.levelup = setInterval(() => {
                if(config.num.score < 200000) {
                    config.Air.level = 1;
                    config.mode[5] = 700;
                }
                else if(config.num.score >= 200000 && config.num.score <= 500000) {
                    config.Air.level = 2;
                    $(".level").html("LV.2");
                    config.Air.bulletType = 1;
                    config.mode[5] = 650;
                }
                else if(config.num.score > 500000 && config.num.score <= 800000) {
                    config.Air.level = 3;
                    $(".level").html("LV.3");
                    config.Air.bulletType = 2;
                    config.mode[5] = 600;
                }
				else if(config.num.score > 800000 && config.num.score <= 1200000) {
					config.Air.level = 4;
					$(".level").html("LV.4");
					config.mode[2] = 120;
				}
				else {
					config.Air.level = 5;
					$(".level").html("LV.5");
					config.mode[2] = 100;
				}
            },100)
		})
	},
	remove: () => {
		let DIV = game.children($("div"));
		setTimeout(() => {
			DIV.remove();
		}, 300)
	}
};

// 核心事件
let core = {
	// 开始游戏
	draw: () => {
		let Air = $("<div class='Air'><img src='" + config.Air.type + "'></div>");
		game.append(Air);

		let lv = $("<div class='lv'></div>");
		game.append(lv);		

		let hp = $("<div class='hp'></div>");
		hp.html("生命值: " + config.Air.hp);
		game.append(hp);

		let bulletCount = $("<div class='bulletCount'></div>");
		bulletCount.html("弹药: " + config.num.bullet);
		game.append(bulletCount);

		let boomCount = $("<div class='boomCount'></div>");
		boomCount.html("导弹: " + config.num.boom);
		game.append(boomCount);

		let status = $("<div class='status'><span class='power'></span><span class='invincible'></span></div>");
		game.append(status);

		let score = $("<div class='score'>0</div>");
		game.append(score);

        let level = $("<div class='level'>LV.0</div>");
        game.append(level);
        
		// 战机高速免费子弹事件
		Air.powerTime = setInterval(() => {
			if(config.Air.powerLimit > 0){
				config.Air.powerLimit--;
				$(".power").html("高速免费子弹: " + config.Air.powerLimit + "S");
			}
			else if(config.Air.powerLimit == 0){
				config.num.interval = 5;
				$(".power").html("");
			}
		}, 1000);

		// 战机无敌事件
		Air.invincible = setInterval(() => {
			if(config.Air.invincible > 0){
				Air.css({
					padding: "5px",
					border: "1px solid red",
					borderRadius: "50%"
				});
				config.Air.invincible--;
				$(".invincible").html("无敌时间: " + config.Air.invincible + "S");
			}
			else {
				Air.css({
					border: "none",
					padding: "5px"
				});
				$(".invincible").html("");
			}
		}, 1000);
	},

	// 战机位置
	Air: pos => {
		let Air = game.find($(".Air")),
			left = pos[0] - Air.width()/2,
			top = pos[1] - Air.height()/2 - 15;

		if(left <= -Air.width()/2){
			left = -Air.width()/2 + 5;
		}
		else if(left >= game.width() - Air.width()/2){
			left = game.width() - Air.width()/2 - 5;
		}

		if(top <= 0){
			top = 0;
		}
		else if(top >= game.height() - Air.height()){
			top = game.height() - Air.height();
		}

		Air.css({
			left: left,
			top: top
		});

		config.num.AirX = left + Air.width()/2;
		config.num.AirY = top + Air.height()/2;

		let t = $(".gift").length;

		// 我方获取礼物
		for(let u=0; u<t; u++){
			let gift = $(".gift").eq(u);
			let bx4 = Math.abs(parseInt(Air.css("left")) - parseInt(gift.css("left"))),
				by4 = Math.abs(parseInt(Air.css("top")) - parseInt(gift.css("top")));

			if(bx4 <= 20 && by4 <= 30) {
				if(gift.attr("src") == "images/resource/gift_more_bullet.png"){
					config.num.bullet += 200;
					$(".bulletCount").html("弹药: " + config.num.bullet);
					gift.remove();
				}
				else if(gift.attr("src") == "images/resource/gift_more_boom.png"){
					config.num.boom += 1;
					$(".boomCount").html("导弹数: " + config.num.boom);
					gift.remove();
				}
				else if(gift.attr("src") == "images/resource/gift_more_health.png"){
					config.Air.hp += 1;
					$(".hp").html("生命值: " + config.Air.hp);
					gift.remove();
				}
				else if(gift.attr("src") == "images/resource/gift_more_power.png"){		// 免费高速子弹十秒
					config.num.interval = 2;
					config.Air.powerLimit += 10;
					gift.remove();
				}
				else if(gift.attr("src") == "images/resource/gift_Invincible.png"){		// 无敌十秒
					config.Air.invincible += 10;
					gift.remove();
				}
			}
		}
	},

	// 战机生命值
	hp: hp => {
		let HP = $(".hp");
		HP.html("生命值:" + hp);
	},
	boom: () => {
		if(config.num.boom > 0){
			config.Air.boom = true;
			config.num.boom--;

			let boomBG = $("<img>");
				boomBG.addClass('boomBG');
				boomBG.attr("src", "images/resource/boom.png");
			game.append(boomBG);

			$(".boomCount").html("导弹数: " + config.num.boom);

			setTimeout(() => {
				config.Air.boom = false;
				boomBG.remove();
			}, 1000);
		}
	},

	// 战机子弹
	bullet: (speed, pos) => {
		/* 战机子弹运动规律,游戏宽高W,H，战机偏移X,Y
		 * 单弹:
		 *    弹药top: Y-H   -> 弹药总运行距离：Y + abs( Y - H ) = H  -> 均匀速度运动
		 *  双弹:
		 *    同上
		 *  三弹:
		 *    中间同上
		 *    左:
		 *      弹药left: X - H * Math.tan(Math.PI/20)
		 *    右：
		 *      弹药left: 2X - H * Math.tan(Math.PI/20)
		 */
		let bullet = $("<div class='bullet'></div>");
		let bullet2 = $("<div class='bullet'></div>");
		let bullet3 = $("<div class='bullet'></div>");
        let type = config.Air.bulletType;
		if(type == 0){									// 单弹
			bullet.css({
				left: pos[0] - bullet.width()/2 + 3,
				top: pos[1] - bullet.height()/2
			});
			bullet.stop().animate(
				{top: config.num.AirY - game.height()},
				speed,
				'linear',
				() => {
					bullet.remove();
				}
			);
			game.append(bullet);
			if(config.Air.powerLimit == 0) {
				config.num.bullet--;
			}
		}
		else if(type == 1){								// 双弹
			bullet.css({
				left: pos[0] - bullet.width()/2 - 5,
				top: pos[1] - bullet.height()/2
			});
			bullet2.css({
				left: pos[0] - bullet.width()/2 + 10,
				top: pos[1] - bullet.height()/2
			});
			game.append(bullet);
			game.append(bullet2);
			if(config.Air.powerLimit == 0) {
				config.num.bullet-=2;
			}
			bullet.stop().animate(	// 修正
				{top: config.num.AirY - game.height()},
				speed,
				'linear',
				() => {
					bullet.remove();
				}
			);
			bullet2.stop().animate(	// 修正
				{top: config.num.AirY - game.height()},
				speed,
				'linear',
				() => {
					bullet2.remove();
				}
			)
		}
		else if(type == 2){								// 三弹
			bullet.css({
				left: pos[0] - bullet.width()/2 + 3,
				top: pos[1] - bullet.height()/2
			});
			bullet2.css({
				left: pos[0] - bullet.width()/2+ 3,
				top: pos[1] - bullet.height()/2
			});
			bullet3.css({
				left: pos[0] - bullet.width()/2 + 3,
				top: pos[1] - bullet.height()/2
			});
			game.append(bullet);
			game.append(bullet2);
			game.append(bullet3);
			if(config.Air.powerLimit == 0) {
				config.num.bullet-=3;
			}
			bullet.stop().animate(	// 修正
				{top: config.num.AirY - game.height()},
				speed,
				'linear',
				() => {
					bullet.remove();
				}
			);
			bullet2.stop().animate(	// 修正 X - H * Math.tan(Math.PI/60)
				{
					top: config.num.AirY - game.height(),
					left: config.num.AirX - game.height()*Math.tan(Math.PI/20)
				},
				speed,
				'linear',
				() => {
					bullet2.remove();
				}
			);
			bullet3.stop().animate(	// 修正
				{
					top: config.num.AirY - game.height(),
					left: config.num.AirX + game.height()*Math.tan(Math.PI/20)
				},
				speed,
				'linear',
				() => {
					bullet3.remove();
				}
			)
		}
		let bulletCount = $(".bulletCount");
			bulletCount.html("弹药: " + config.num.bullet);

	},
	// 敌机生成
	enemy: argument => {
		let speed = argument.speed,
			left = argument.left,
			top = argument.top,
			type = argument.type,
			gift = argument.type;
		// 经验值
		switch(argument.type){
			case 0:							// F15，射速快
			case 1:
			case 2:
			case 3:
            case 12:
            case 13:
				argument.exp = 1000;
				argument.bulletlimit = 1500 - config.num.enemybulletlimit;
				argument.bullettype = 1;
				argument.hp = 1;
				argument.bulletSpeed = 2000;
				break;
			case 4:							// F16，子弹频率稍快
			case 5:
            case 17:
				argument.exp = 1200;
				argument.bulletlimit = 1400 - config.num.enemybulletlimit;
				argument.bullettype = 1;
				argument.hp = 1;
				argument.bulletSpeed = 3000;
				break;
			case 6:							// F35，三弹，血多，子弹频率稍慢，射速慢
            case 18:
            case 19:
				argument.exp = 2000;
				argument.bulletlimit = 1700 - config.num.enemybulletlimit;
				argument.bullettype = 2;
				argument.hp = 2;
				argument.bulletSpeed = 3800;
				break;
			case 7:							// J10，血多，子弹频率慢，射速快
			case 8:
            case 14:
            case 15:
            case 16:
				argument.exp = 1500;
				argument.bulletlimit = 1600 - config.num.enemybulletlimit;
				argument.bullettype = 1;
				argument.hp = 2;
				argument.bulletSpeed = 2000;
				break;
			case 9:							// J31，血多
			case 10:
				argument.exp = 2500;
				argument.bulletlimit = 1700 - config.num.enemybulletlimit;
				argument.bullettype = 1;
				argument.hp = 3;
				argument.bulletSpeed = 2800;
				break;
			case 11:						// T50,五弹，射速快，频率高
				argument.exp = 5000;
				argument.bulletlimit = 1500 - config.num.enemybulletlimit;
				argument.bullettype = 3;
				argument.hp = 4;
				argument.bulletSpeed = 2200;
				break;
		}

		let oEnemy = $("<div class='enemy'><img style='width:30px' src='" + config.type[type] + "'</div>");
			oEnemy.css({
				left: left,
				top: top
			});

			oEnemy.appendTo(game);
			oEnemy.stop().animate(
				{top: game.height()},
				speed,
				'linear',
				() => {
					oEnemy.remove();
					clearInterval(oEnemy.timer);
					clearInterval(oEnemy.bulletTimer);
				}
			);

		// 敌机子弹事件
		oEnemy.bulletTimer = setInterval(() => {
			let x = parseInt(oEnemy.css("left")) + 6,
				y = parseInt(oEnemy.css("top")) + 15;

			let enemyBullet = $("<div class='enemyBullet'></div>");
			let enemyBullet2 = $("<div class='enemyBullet'></div>");
			let enemyBullet3 = $("<div class='enemyBullet'></div>");
			let enemyBullet4 = $("<div class='enemyBullet'></div>");
			let enemyBullet5 = $("<div class='enemyBullet'></div>");

			if(argument.bullettype == 1) {				// 单弹
				enemyBullet.css({
					left: x - enemyBullet.width()/2 + 5,
					top: y + enemyBullet.height()*3
				});
				enemyBullet.stop().animate(
					{top: game.height() + y},
					argument.bulletSpeed,
					'linear',
					() => {
						enemyBullet.remove();
					}
				);
				game.append(enemyBullet);
			}
			else if(argument.bullettype == 2){				// 三弹
				enemyBullet.css({
					left: x - enemyBullet.width()/2 + 5,
					top: y + enemyBullet.height()*2
				});
				enemyBullet2.css({
					left: x - enemyBullet.width()/2 + 5,
					top: y + enemyBullet.height()*2
				});
				enemyBullet3.css({
					left: x - enemyBullet.width()/2 + 5,
					top: y + enemyBullet.height()*2
				});
				enemyBullet.stop().animate(
					{top: game.height() + y},
					argument.bulletSpeed,
					'linear',
					() => {
						enemyBullet.remove();
					}
				);
				enemyBullet2.stop().animate(
					{
						top: game.height() + y,
						left: left - 3000*Math.tan(Math.PI/45)
					},
					argument.bulletSpeed,
					'linear',
					() => {
						enemyBullet2.remove();
					}
				);
				enemyBullet3.stop().animate(
					{
						top: game.height() + y,
						left: left + 3000*Math.tan(Math.PI/45)
					},
					argument.bulletSpeed,
					'linear',
					() => {
						enemyBullet3.remove();
					}
				);
				game.append(enemyBullet);
				game.append(enemyBullet2);
				game.append(enemyBullet3);
			}
			else if(argument.bullettype == 3){				// 五弹
				enemyBullet.css({
					left: x - enemyBullet.width()/2 + 5,
					top: y + enemyBullet.height()*2
				});
				enemyBullet2.css({
					left: x - enemyBullet.width()/2 + 5,
					top: y + enemyBullet.height()*2
				});
				enemyBullet3.css({
					left: x - enemyBullet.width()/2 + 5,
					top: y + enemyBullet.height()*2
				});
				enemyBullet4.css({
					left: x - enemyBullet.width()/2 + 5,
					top: y + enemyBullet.height()*2
				});
				enemyBullet5.css({
					left: x - enemyBullet.width()/2 + 5,
					top: y + enemyBullet.height()*2
				});
				enemyBullet.stop().animate(
					{top: game.height() + y},
					argument.bulletSpeed,
					'linear',
					() => {
						enemyBullet.remove();
					}
				);
				enemyBullet2.stop().animate(
					{
						top: game.height() + y,
						left: left - 3000*Math.tan(Math.PI/45)
					},
					argument.bulletSpeed,
					'linear',
					() => {
						enemyBullet2.remove();
					}
				);
				enemyBullet3.stop().animate(
					{
						top: game.height() + y,
						left: left + 3000*Math.tan(Math.PI/45)
					},
					argument.bulletSpeed,
					'linear',
					() => {
						enemyBullet3.remove();
					}
				);
				enemyBullet4.stop().animate(
					{
						top: game.height() + y,
						left: left - 3000*Math.tan(Math.PI/25)
					},
					argument.bulletSpeed,
					'linear',
					() => {
						enemyBullet4.remove();
					}
				);
				enemyBullet5.stop().animate(
					{
						top: game.height() + y,
						left: left + 3000*Math.tan(Math.PI/25)
					},
					argument.bulletSpeed,
					'linear',
					() => {
						enemyBullet5.remove();
					}
				);
				game.append(enemyBullet);
				game.append(enemyBullet2);
				game.append(enemyBullet3);
				game.append(enemyBullet4);
				game.append(enemyBullet5);
			}
		}, argument.bulletlimit);

		let hurt = true;
		// 碰撞检测
		oEnemy.timer = setInterval(() => {
			let x = parseInt(oEnemy.css("left")) + 12,
				y = parseInt(oEnemy.css("top")) + 15,
				l = $(".bullet").length,
				k = $(".enemyBullet").length;
			// 导弹爆炸
			if(!config.Air.boom){
				hurt = true;
			}
			if(config.Air.boom&&hurt){
				hurt = false;
				argument.hp-=5;
				// 5条血下秒杀
				if(argument.hp <= 0){
					oEnemy.css("background", "url('img/boom.png')");
					if(argument.gift > 0 && argument.gift < 10) {
						setTimeout(() => {
							let gift = $("<img>");
							gift.addClass('gift');
							gift.css({
								left: x,
								top: y
							});
							gift.attr("src", config.resource[argument.gift]);
							gift.stop().animate(
								{top: y + game.height()},
								config.num.giftSpeed,
								'linear',
								() => {
									gift.remove();
								}
							);
							game.append(gift);
						}, 300);
					}
					setTimeout(() => {
						oEnemy.remove();
					}, 300);
					clearInterval(oEnemy.bulletTimer);
					clearInterval(oEnemy.timer);
					config.num.score += argument.exp;
					game.find($(".score")).html(config.num.score);

					for(let w=0; w<k; w++){
						$(".enemyBullet").eq(w).remove();
					}
				}
			}

			// 敌机与我方子弹触碰
			for(let i=0; i<l; i++){
				let bx = Math.abs( x - parseInt($(".bullet").eq(i).css("left"))),
					by = Math.abs( y - parseInt($(".bullet").eq(i).css("top")));

				if(bx <= 14 && by <= 20) {
					argument.hp--;
					if(argument.hp > 0){
						$(".bullet").eq(i).remove();
						oEnemy.css("background", "url('img/boom.png')");
						setTimeout(() => {
							oEnemy.css("background", "");
						}, 300);
					}
					else {
						// 掉礼物
						oEnemy.css("background", "url('img/boom.png')");
						if(argument.gift > 0 && argument.gift < 10) {
							setTimeout(() => {
								let gift = $("<img>");
								gift.addClass('gift');
								gift.css({
									left: x,
									top: y
								});
								gift.attr("src", config.resource[argument.gift]);
								gift.stop().animate(
									{top: y + game.height()},
									config.num.giftSpeed,
									'linear',
									() => {
										gift.remove();
									}
								);
								game.append(gift);
							}, 300);
						}
						setTimeout(() => {
							oEnemy.remove();
						}, 300);
						$(".bullet").eq(i).remove();
						clearInterval(oEnemy.bulletTimer);
						clearInterval(oEnemy.timer);
						config.num.score += argument.exp;
						game.find($(".score")).html(config.num.score);
					}
				}
			}

			// 我方与敌机子弹碰撞
			for(let d=0; d<k; d++) {
				let bx2 = Math.abs(parseInt($(".Air").css("left")) - parseInt($(".enemyBullet").eq(d).css("left")) + 12),
					by2 = Math.abs(parseInt($(".Air").css("top")) - parseInt($(".enemyBullet").eq(d).css("top")) + 15);

				if(bx2 <= 14 && by2 <= 20) {
					if(!config.Air.invincible){
						config.Air.hp--;
						core.hp(config.Air.hp);
					}
					if(config.Air.hp <= 0) {
						core.GameOver();
					}
					else {
						$(".enemyBullet").eq(d).remove();
						$(".Air").css("background", "url('img/boom2.png')");
						setTimeout(() =>  {
							$(".Air").css("background", "");
						}, 1000);
					}
				}
			}

			// 我方与敌机碰撞
			let bx3 = Math.abs(x - parseInt($(".Air").css("left")) - 30),
				by3 = Math.abs(y - parseInt($(".Air").css("top")) - 18);
			if(bx3 <= 40 && by3 <= 33) {
				if(!config.Air.invincible){
					config.Air.hp--;
					core.hp(config.Air.hp);
				}
                if(argument.gift > 0 && argument.gift < 10) {
                    setTimeout(() => {
                        let gift = $("<img>");
                        gift.addClass('gift');
                        gift.css({
                            left: x,
                            top: y
                        });
                        gift.attr("src", config.resource[argument.gift]);
                        gift.stop().animate(
                            {top: y + game.height()},
                            config.num.giftSpeed,
                            'linear',
                            () => {
                                gift.remove();
                            }
                        );
                        game.append(gift);
                    }, 300);
                }
				oEnemy.css("background", "url('img/boom.png')");
				setTimeout(() => {
					oEnemy.remove();
				}, 300);

                config.num.score += argument.exp;
                game.find($(".score")).html(config.num.score);

				clearInterval(oEnemy.bulletTimer);
				clearInterval(oEnemy.timer);

				if(config.Air.hp <= 0) {
					core.GameOver();
				}
				else {
					$(".Air").css("background", "url('img/boom2.png')");
					setTimeout(() => {
						$(".Air").css("background", "");
					}, 1000);
				}
			}
		});

	},
	GameOver: () => {

		$(".hp").remove();
		$(".bulletCount").remove();
		$(".Air").remove();
		$(".boomCount").remove();
        $(".level").remove();
		$(".status").remove();
		let tips = $("<div class='tips'></div>");
		tips.html("<span>Game Over</span><span>分数:" + $(".score").html() + "</span><p>重来</p>");
		setTimeout(() =>  {
			game.append(tips);
		}, 3000);

		let temp = {
			name: config.name,
			score: $(".score").html(),
			time: new Date().toLocaleString()
		};
		result.push(temp);
		if(result.length > 10){
			result.shift();
		}
		localStorage["result"] = JSON.stringify(result);
		localStorage["name"] = config.name;
		$(".score").css("display", "none");
		$(".Air").css("background", "url('img/boom2.png')");

		game.delegate(".tips p", "click", () =>  {
			config.num.score = 0;
			config.Air.hp = 3;
			config.num.interval = 5;
            config.num.boom = 3;
            config.num.bullet = 1000;
            config.Air.level = 0;
            config.Air.bulletType = 0;
            config.mode = [null, 900, 150, 6500, 7500, 800, 1000];
			setList();
			startScreen.remove();
			startScreen.draw();
		});

		clearInterval(core.Air.invincible);
		clearInterval(core.Air.powerTime);
		clearInterval(config.timer.bullet);
		clearInterval(config.timer.enemy);
        clearInterval(config.timer.levelup);
	}
};
let randomNum = (a, b) => {
	let value = Math.abs(a-b), num;
	return parseInt(Math.random()*value) + Math.min(a,b);
};
let setList = () => {
	list = $("<ul></ul>");
	let before = $("<li><span>名字</span><span>分数</span><span>时间</span></li>");
	list.prepend(before);
	$.each(result,(n, one) => {
		let text =  $("<li></li>");
		$.each(one, (key, value) => {
			text.append("<span>" + value + "</span>");
		});
		list.append(text);
	});
};
