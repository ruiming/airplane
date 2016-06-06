$(function () {
	game.startScreen.draw();
});


var game = {

	enemyType: [
		"images/enemy/F15.png",
		"images/enemy/F16.png",
		"images/enemy/F35.png"
	],

	stage : $("#box"),
	
	modetxt : "",
	
	timer : {
		bg : null,
		bullet : null,
		enemy : null
	},
	//子弹速度set[1]，子弹延迟set[2], 敌机速度set[3]到set[4]之间，敌机产生间距set[5]
	mode : [
		[3,900,150,9000,9500,700]
	], //参数配置
	num : {
		count : 0,
		warcraftX : 0,
		warcraftY : 0,
		score : 0
	},
	stitle : function ( score ) {
		switch ( game.modetxt ) {
			case '开始游戏' : 
				if( score == 0 ) {
					return '屌丝中的屌丝';
				}
				else if( score <= 20000 ) {
					return '入门级屌丝'
				}
				else if( score <= 100000 && score > 20000 ) {
					return '资深屌丝'
				}
				else if( score <= 500000 && score > 100000 ) {
					return '知名屌丝'
				}
				else {
					return '全国十佳屌丝';
				}
		}
	},
	startScreen : {
		draw : function () {
			var title = $("<div>");
				title.addClass("title");
				title.html("打飞机 1.0 Javascript版");
				game.stage.append(title);
			
			var difficulty = $("<div class='difficulty'><a href='javascript:void(0)'>开始游戏</a></div>");
				game.stage.append(difficulty);

			// 开始游戏后才开始鼠标监听
			game.stage.find($(".difficulty")).delegate("a","click", function ( e ) {
				game.stage.start = true ;
				game.startScreen.remove();
				// 监听鼠标位移事件
				$(document).mousemove( function ( e ) {
					var x = e.clientX - game.stage.offset().left;
					var y = e.clientY - game.stage.offset().top;
					// 补充加上外边距损失10px
					game.core.warcraft([x,y]);
					// 获取此时鼠标位置并设置战机位置
				});
				// 这里来控制mode
				var set = game.mode[$(this).index()];
				game.modetxt = $(this).html();
				game.core.draw(set[0]);
				// 设置子弹，子弹速度set[1]，子弹延迟set[2]
				game.timer.bullet = setInterval ( function () {
					game.core.bullet(set[1],[game.num.warcraftX,game.num.warcraftY]);
				},set[2]);
				// 产生战机，敌机速度在set[3]到set[4]之间，敌机产生时间间距为set[5]
				game.timer.enemy =setInterval ( function () {
					game.core.enemy({
						speed : game.randomNum(set[3],set[4]),
						left : game.randomNum(0,577),
						top : -game.randomNum(30,80),
						type: game.randomNum(1, 3),
						gift: game.randomNum(1, 100)	// 携带礼物
						// 随机产生战机
					});
				},set[5])
			
			});
		}, //绘制开始界面
		remove : function () {
			var removeDiv = game.stage.children($("div"));
			removeDiv.stop().animate({opacity:0},100);
			setTimeout( function () {
				removeDiv.remove();
			},300)
		}
	}, //开始场景
	core : {
		draw : function ( speed ) {
			var warcraft = $("<div class='warcraft'><img src='images/J-10/J-10.png'></div>");
			game.stage.append(warcraft);
			var score = $("<div class='score'>0</div>");
			game.stage.append(score);
		}, //绘制游戏场景
		warcraft : function ( pos ) {
			// pos为鼠标目前定位
			// 从鼠标监听中重新设置战机位置
			var warcraft = game.stage.find($(".warcraft")),
				left =  pos[0] - warcraft.width()/2 - 15,
				top =  pos[1] - warcraft.height()/2 - 15;
				// warcraft是战机,该处是战机相对位置

			if( left <= -warcraft.width()/2 ) {
				left = -warcraft.width()/2 + 5;
			}
			else if( left >= game.stage.width() - warcraft.width()/2) {
				left = game.stage.width() - warcraft.width()/2 - 5;
			}
			if( top <= 0) {
				top = 0;
			}
			else if ( top >= game.stage.height() - warcraft.height()) {
				top = game.stage.height() - warcraft.height();
			}
			// 设置战机位置
			warcraft.css({left:left,top:top});
			game.num.warcraftX = left + warcraft.width()/2;
			game.num.warcraftY = top + warcraft.height()/2;
		},
		// 发射子弹
		bullet : function ( speed ,pos ) {
			var bullet = $("<div class='bullet'></div>");
			game.stage.append(bullet);
			// 子弹位置
			bullet.css({
					left : pos[0] - bullet.width()/2,
					top : pos[1] - bullet.height()/2
				});
			bullet.stop().animate({top:-bullet.height()},speed,function () { bullet.remove();})
		},
		enemy : function ( argument ) {
			var speed = argument.speed;
			var left = argument.left;
			var top = argument.top;
			var type = argument.type;	// 敌机类别
			var gift = argument.type;	// 敌机携带
			// 产生不同类别战机
			var oEnemy  = $("<div class='enemy'><img style='width:30px' src='" + game.enemyType[type] + "'></div>");
				oEnemy.css({
					left : left,
					top : top
				});
			oEnemy.appendTo(game.stage);
			// 从上到下后，运动到1000px之后消失
			oEnemy.stop().animate( { top:1000 }, speed , function () { oEnemy.remove(); clearInterval(oEnemy.timer)});


			// 敌机发射子弹事件
			oEnemy.bulletTimer = setInterval(function(){
				var enemyBullet = $("<div class='enemyBullet'></div>");
				var x = parseInt(oEnemy.css("left")) + 12,
					y = parseInt(oEnemy.css("top")) + 15;
				game.stage.append(enemyBullet);
				// 子弹位置
				enemyBullet.css({
					left : x - enemyBullet.width()/2 + 5,
					top : y + enemyBullet.height()*2
				});
				enemyBullet.stop().animate({top:1500},speed/2,function () {
					enemyBullet.remove();
					clearInterval(oEnemy.bulletTimer);
				})
			}, 1500);

			// 敌机事件
			oEnemy.timer = setInterval ( function () {
				var x = parseInt(oEnemy.css("left")) + 12,
					y = parseInt(oEnemy.css("top")) + 15,

					// 当前的子弹个数
					l = $(".bullet").length;

				for( var i = 0 ; i< l; i++ ) {
					// 计算子弹距离敌机的距离
					var bx = Math.abs( x - parseInt($(".bullet").eq(i).css("left"))),
						by = Math.abs( y - parseInt($(".bullet").eq(i).css("top")));
					if( bx <= 14 &&  by <= 20 ) {
						// 敌机爆炸
						oEnemy.css("background","url('img/boom.png')");
						// 移除该子弹
						$(".bullet").eq(i).remove();
						// 取消循环
						clearInterval(oEnemy.timer);
						clearInterval(oEnemy.bulletTimer);
						// 加分数
						game.num.score++;
						game.stage.find($(".score")).html(game.num.score*1000);
						// 敌机移除
						setTimeout( function () { oEnemy.remove(); },300)
					}
				}

				var k = $(".enemyBullet").length;	// 敌机子弹数量
				for( var d = 0 ; d< k; d++ ) {
					// 计算子弹距离敌机的距离
					var bx3 = Math.abs( parseInt($(".warcraft").css("left")) - parseInt($(".enemyBullet").eq(d).css("left")) + 12),
						by3 = Math.abs( parseInt($(".warcraft").css("top")) - parseInt($(".enemyBullet").eq(d).css("top")) + 15);
					if( bx3 <= 14 &&  by3 <= 20 ) {
						var tips = $("<div class='tips'></div>");
						tips.html("<span>Game Over</span><span>分数:"+$(".score").html() + "</span><p>重来</p>");
						game.stage.delegate(".tips p",'click',function(){
							// 重来，分数清零，重绘开始页面
							game.num.score = 0;
							game.startScreen.remove();
							game.startScreen.draw();
						});
						// 移除敌机
						oEnemy.remove();
						// 分数隐藏，战机爆炸
						$(".score").css("display","none");
						$(".warcraft").css("background","url('img/boom2.png')");
						// 清除计数器和循环
						clearInterval(oEnemy.timer);
						setTimeout( function () { $(".warcraft").remove(); },300);
						clearInterval(game.timer.bullet);
						clearInterval(oEnemy.bulletTimer);
						clearInterval(game.timer.enemy);
						clearInterval(game.timer.bg);
						setTimeout( function () {
							game.stage.append(tips);
						},3000)
					}
				}


				// 敌机或子弹距离飞机位置
				var bx2 = Math.abs( x - parseInt($(".warcraft").css("left")) - 30),
					by2 = Math.abs( y - parseInt($(".warcraft").css("top")) - 18);
				if( bx2 <= 40 &&  by2 <= 33 ) {
					var tips = $("<div class='tips'></div>");
					tips.html("<span>Game Over</span><span>分数:"+$(".score").html() + "</span><p>重来</p>");
					game.stage.delegate(".tips p",'click',function(){
						// 重来，分数清零，重绘开始页面
						game.num.score = 0;
						game.startScreen.remove();
						game.startScreen.draw();
					});
					// 移除敌机
					oEnemy.remove();
					// 分数隐藏，战机爆炸
					$(".score").css("display","none");
					$(".warcraft").css("background","url('img/boom2.png')");
					// 清除计数器和循环
					clearInterval(oEnemy.timer);
					setTimeout( function () { $(".warcraft").remove(); },300)
					clearInterval(game.timer.bullet);
					clearInterval(oEnemy.bulletTimer);
					clearInterval(game.timer.enemy);
					clearInterval(game.timer.bg);
					setTimeout( function () {
						game.stage.append(tips);
					},3000)
				}
			},50)
		} //敌机

	}, //核心代码
	randomNum : function (a,b){
		var value = Math.abs(a-b) , num ;
		num = parseInt(Math.random()*(value)) + Math.min(a,b);
		return num;
	} //产生指定区域整形随机数。
};