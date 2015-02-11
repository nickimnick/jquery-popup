			/*
				Minus Popup Plug-in Lite v5.3.2 www.minus99.com - 2013
			*/

(function($){
	$.fn.extend({
		minusPopup : function(options){
							
			var defaults = {
				width:0,						//Popupin genisligi (responsive için deger 0 verilmelidir)
				widthStyle:'width',				//"width" parametresinin nereye atanacagi (width | max-width | min-width) olarak atanmasi
				height:0,						//Popupin yüksekligi (içerige göre yükseklik almasi gerekiyorsa deger 0 verilmelidir)
				percent:1,						//Popup'in pencereye göre belli bir yüzde ile boyutlanmasi
				spacer:0,						//Popup yüksekligi pencere yüksekliginden fazla ise ya da popup ortalanmayacak ise üst bosluk
				timeout:0,						//Popup otomatik kapanma süresi (0 ise otomatik kapanmaz)
				openWith:'click',				//Popupin ne sekilde açilacagi (click | auto)
				closeWith:'.btnMinPpCl', 		//Kapat buttonu disinda baska herhangi bir yere tiklandiginda popupin kapanabilmesi
				closeText:'',					//Kapat buttonunun texti
				customClass: '',				//Popupi özellestirmek için özel bir class eklenebilir
				master:'',						//Ayni anda birden fazla popup kullanimi
				header: '',						//Popupin basligi
				footer:'',						//Popup'in footerina eklenecek content
				content:'',						//Popupta yer alacak olan içerik (Not: Tek satirda olacak sekilde yazilmalidir.)
				type:'content',					//Popup content tipi (content | iframe | image | object)
				href:'',						//"image" kullaniliyorsa ve linki varsa "href" i buraya yazilir. Url'de http var ise yeni pencerede açar
				target:'self',					//"imageLink" targetini belirler
				scrollSpeed:500,				//Popup scroll hizi
				scrollable:true,				//Sayfa scroll oldugunda popup'in hareket etmesi
				speed:0,						//Gölgenin fadeIn/fadeOut animate süresi
				opacity:0.5,					//Gölgenin max. opacity degeri
				callBack:'',					//Popupin açilmasi esnasinda herhangi baska bir kodun tetiklenmesi
				fire:''							//Popupin kapanmasi sonrasinda herhangi baska bir kodun tetiklenmesi

			};
			
			var options = $.extend(defaults, options);
			
			return this.each(function(){
				var opt = options,
				obj = $(this);
				
				init();
				
				function init(){
					
					if($('#minHider'+opt.master).html() == null) $('body').append('<div id="minHider'+opt.master+'" style="display:none; width:100%;"></div><div class="minPpWrp'+opt.master+'" style="visibility:hidden; overflow:hidden;"><div class="minPp'+opt.master+'"><a href="javascript:void(0);" class="btnMinPpCl"></a><div class="minPphdr'+opt.master+'" style="display:none;"></div><div class="minPpBdy'+opt.master+'"></div><div class="minPpFtr'+opt.master+'" style="display:none;"></div></div></div>');
					
					var popupPosition, wh, ww, hd, pOff, ppHh, ppFh,
					IE8LTE = navigator.userAgent.match(/MSIE\s(?!9.0)/),
					hider = $('#minHider'+opt.master),
					holder = $('.minPpWrp'+opt.master),
					popup = $('.minPp'+opt.master),
					ppHdr = $('.minPphdr'+opt.master),
					ppBody = $('.minPpBdy'+opt.master),
					ppFtr = $('.minPpFtr'+opt.master),
					resizable = true,
					isOpen = false,
					imgH = 0,
					imgW = 0,
					popupH, ratio;

					function getDims(){
						ww = window.innerWidth,
						wh = window.innerHeight,
						hd = $(document).height(),
						scrl = $(window).scrollTop();
						
						// Browser IE8 için scrollTop & innerHeight fix
						if (IE8LTE){
							scrl = $("html, body").scrollTop(),
							wh = $(window).height();
							ww = $(window).width();
						}	
					}

					function minPpDim(){
						getDims();
						$(hider).css({height: wh, opacity:opt.opacity}).fadeIn(opt.speed, function(){$(holder).css("visibility", "visible");});
						if(opt.width != 0) $(popup).css(opt.widthStyle, opt.width+"px");
						
						if(opt.type != 'image' && opt.percent != 1){
							popupH = wh*opt.percent;
							ppHh = $(ppHdr).outerHeight(false);
							ppFh = $(ppFtr).outerHeight(false);
							$(ppBody).height(popupH - (ppHh + ppFh));
						}else if(opt.type == 'image'){
							checkImg(opt.content);
						}else if(opt.type == 'iframe'){
							popupH = opt.height;
							$(ppBody).css("height", opt.height);
						}else{
							popupH = $(popup).outerHeight(false);	
						}
						
						if(opt.type != 'image') autoPosition();
					}
					
					function autoPosition(){
						if(popupH > wh && scrl+opt.spacer+popupH < hd){
							$(holder).css({top:scrl+opt.spacer});
						}else if(popupH < wh){
							$(holder).css({top:scrl + ((wh - popupH)/2)});
						}else{
							$(holder).css({top:scrl+wh-(popupH+opt.spacer)});
							window.scrollTo(0, scrl+wh-(popupH+opt.spacer));
						}	
					}
					
					$(window).resize(function(){
						if(resizable && isOpen){
							resizable = false;
							setTimeout(function(){
								resizable = true;
								$(holder).css({top:0});	//Sayfa çok küçük iken birden büyüyünce popup, sayfa yüksekligini etkilemesin
								minPpDim();
								scrolling();
							}, 100);
						}
					});
					
					$(window).scroll(function(){ if(isOpen && opt.scrollable) scrolling(); });
					
					function scrolling(){
						getDims();
						pOff = $(popup).offset();

						if(popupH < wh){
							$(holder).stop().animate({top: scrl + ((wh - popupH)/2)+'px'}, opt.scrollSpeed);
						}else if(popupH > wh && scrl+opt.spacer+popupH < hd){
							if(scrl > pOff.top+popupH || scrl < pOff.top) $(holder).stop().animate({top: scrl+opt.spacer+'px'}, opt.scrollSpeed);
						}	
					}
					
					function checkImg(k){
						var img = new Image();
						img.onload = function(){
						  	imgH = this.height;
						  	imgW = this.width;
						  	ratio = imgW/imgH;
							
							if(opt.percent == 1){
								$(popup).height(imgH);
								popupH = imgH;
							}else{
								var imgNH, imgNW;
								
								if(wh < ww && (ww/wh) > ratio) imgNH = wh*opt.percent, imgNW = imgNH*ratio;
								else imgNW = ww*opt.percent, imgNH = imgNW/ratio;

								$('img.minPpImg', popup).height(imgNH).width(imgNW);
								$(popup).height(imgNH).width(imgNW);
								popupH = imgNH;	
							}
							
							autoPosition();
							scrolling();
						}
						img.src = k;
					}
					
					function runIt(e){ if(e) $.globalEval(e); }

					function prepareContent(){
						if(opt.closeText != '') $('a.btnMinPpCl', popup).html(opt.closeText);
						if(opt.header != '') $(ppHdr).html(opt.header).show();
						if(opt.footer != '') $(ppFtr).html(opt.footer).show();
						
						switch(opt.type){
							case 'content':
							$(ppBody).html(opt.content);
							break;
							 
							case 'image':
							if(opt.href != '') $(ppBody).html('<a target="_'+opt.target+'" class="minPpImgLink" href="'+opt.href+'"><img border="0" src="'+opt.content+'" /></a>');
							else $(ppBody).html('<img class="minPpImg" border="0" src="'+opt.content+'" />');
							break;
							 
							case 'iframe':
							$(ppBody).html('<iframe class="minPpIframe" frameborder="0" name="minPpIframe" style="margin:0; padding:0; width:100%; height:100%;" src="'+opt.content+'"></iframe>');
							break;
							
							case 'object':
							$(ppBody).html($(opt.content).html());
							break;
						}
					}
					
					function minPpOpen(){
						isOpen = true;		
						prepareContent();
						
						if(opt.customClass != '') $(popup).addClass(opt.customClass);
						
						minPpDim();
						
						if(opt.callBack != '') runIt(opt.callBack);
						if(opt.timeout > 0) setTimeout(function(){minPpClose();}, opt.timeout);
						if(opt.closeWith != '.btnMinPpCl') closeWith();
					}
					
					if(opt.openWith == 'click') $(obj).click(minPpOpen); else if(opt.openWith == 'auto') minPpOpen();
					
					function minPpClose(){
						isOpen = false;
						$(holder).css("visibility", "hidden");
						$(hider).fadeOut(opt.speed);
						$(popup).removeAttr("style");
						
						if($('iframe', ppBody).length > 0)
							$('iframe', ppBody).removeAttr('src');
							
						$(ppBody).html('').removeAttr("style");
						$(ppFtr).html('').hide();
						$(ppHdr).html('').hide();
						
						if(opt.customClass != '') $(popup).removeClass(opt.customClass);
						if(opt.fire != '') runIt(opt.fire);
					}

					$('.btnMinPpCl', popup).click(function(){ minPpClose();});
					
					$(document).keyup(function(e){ if(e.keyCode == 27){ minPpClose(); } });
					
					function closeWith(){ $(opt.closeWith).click(function(){ minPpClose(); }); }
					
				}
				
			});
		}
	});
	
})(jQuery);