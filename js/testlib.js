/**
 * ...
 * @author xdsnet
 */
var panflag=false; //全局状态控制变量，表示是否已经提交判分。
var sjName=''; //试卷名称
var stlist=[]; //试题列表，其分类存放各题目,仅支持选择题（单，多，不定项以及作为单选选择特例的判断题）
var tx={t1:"单项选择题",t2:"多项选择题",t3:"判断题",t4:"案例分析"};
var sl=['A','B','C','D','E','F','G','H'];
var cuNum='';
var daohan=[];//用于导航的数组
var daohanNum=-1;//用于导航的数组指针
var daoLength=0;//导航数组元素个数
function xuanzeti(){
	this.tigan="";//题干
	this.fen=10;//单题分值
	this.tx="选择题";//题型
	this.awlist=[];//备选项
	this.issel=false;//是否已经做
	this.setNum=function(mnum,numb){
		var i;
		this.issel=true;
		if(( (this.tx.toString()=="t1") || (this.tx.toString()=="t3") ) && numb ){
			for(i=0;i<this.awlist.length;i++){
				this.awlist[i].uchk=false;
			}
		}
		this.awlist[mnum].uchk=numb;
	}
	
	this.endok=function (){ //判断是否选择正确
		var rt=true;
		for (var i=0;i<this.awlist.length;i++){
			rt = rt && this.awlist[i].testme();
		}
		return rt;
	}
	
	this.addaw=function (){ //添加选项
		this.awlist.push(new xuanxiang());
	}
	
	this.awrandom=function(){ //随机排列选项
		this.awlist.sort(function(){return (Math.randome()>0.5)});
	}
	
	this.showme=function(){  //显示处理
		//1. 处理本题对应显示和交互捕获
		//2. 分为答题状态和判分后状态（判分状态由全局状态控制变量 panflag 标志）
		/*
		<input type="radio" name="sex" value="male" />
		<input type="checkbox" name="car" />
		*/
		$("#tixing").html(tx[this.tx]);
		$("#tigan").html(this.tigan.replace('\\n','<br/>') );
		var tl=this.awlist.length;
		var sls='';
		var it='';
		var i=0;
		if(this.tx=='t1'||this.tx=='t3')it="radio";
		if(this.tx=='t2'||this.tx=='t4')it="checkbox";
		for(i=0;i<tl;i++){
			sls=sls+"<input type='"+it+"' id='"+it+cuNum+"_"+i+"' accesskey='"+sl[i].toLowerCase()+"' name='"+it+cuNum+"' value='"+i+"' onclick='chme(this)'>"+sl[i]+"."+this.awlist[i].text+"</input><br/>";
		}
		if(panflag){
			//添加显示正确答案处理
			sls=sls+"<p class='daan' title='正确答案是:"+this.showRight()+"'>=鼠标放上不动则显示正确答案=</p>";
		}
		$("#xuanxianglist").html(sls);
		for(i=0;i<tl;i++){
			if(this.issel){
			//如果已经选择过则显示时重建选项状态
				$("input#"+it+cuNum+"_"+i).attr("checked",this.awlist[i].uchk);
			}
			if(panflag){
			//如果已经判分是时的选项可操作性去除
				$("input#"+it+cuNum+"_"+i).attr("disabled",true);
			}
		}
	}
	this.showRight=function(){
		var l=this.awlist.length;
		var rt='';
		for(var i=0;i<l;i++){
			if(this.awlist[i].isok){
				rt=rt+sl[i];
			}
		}
		return rt;
	}
	this.addfen=function(){
		var rt=0;
		if(this.endok) rt=this.fen;
		return rt;
	}
}

function chme(ain){
	var obj=getNumTi(ain.name);
	stlist[obj.i].ti[obj.j].setNum(ain.value,ain.checked);
}

function tijiao(){ //提交处理
	//1. 作为数据化初始化完成后显示提交评判按钮点击后的处理
	//2. 主要处理有显示得分/置各题目的判断结果/置各题目为可以显示答案（置全局状态控制变量 panflag=true）
	selnum('');
	panflag=true;
	var obj=tongji();
	$("#tigan").html("你的最后得分是"+obj.fen+"分。");
	$("#xuanxianglist").html("其中<br/>"+obj.rt);
	$("#tixing").html("&nbsp;");
	$("#tihao").html("_?_");
	$("#tijiao").html("可以选择各题显示作答情况和正确选项");	
	daohanNum=-1;
	pdB();
}

function pdB(){
	$("#Pbutton").attr("disabled",false);
	$("#Nbutton").attr("disabled",false);
	if(daohanNum<1) $("#Pbutton").attr("disabled",true);
	if(daohanNum>(daoLength-2)) $("#Nbutton").attr("disabled",true);
}

function tongji(){ //判分统计处理
	var i=0;
	var j=0;
	var fen=0;//总分
	var r=0;//单类正确题数
	var w=0;//单类错误题数
	var all=0;//题数
	var w=0;//单类错误题数
	var rt='';//评语
	var rtobj={};
	for(i=0;i<stlist.length;i++){
		r=0;
		w=0;
		all=stlist[i].ti.length;
		rt=rt+tx[stlist[i].tx];
		for(j=0;j<all;j++){
			if(stlist[i].ti[j].endok()){
				r++;
				fen+=stlist[i].ti[j].fen;
				$("#T_"+i+"_"+j).parent().css("background","#ccffcc");
			}else{
				w++;
				$("#T_"+i+"_"+j).parent().css("background","#ffcccc");
			}
		}
		rt=rt+"共"+all+"道，回答正确"+r+"道，回答错误"+w+"道<br/>";
	}
	rtobj.fen=fen;
	rtobj.rt=rt;
	return rtobj;
}

function xuanxiang(){
	this.text="";
	this.isok=false;
	this.uchk=false;
	this.testme=function (){
		return (this.isok==this.uchk);
	}
	this.settext=function (intext){
		if (typeof(intext)=="String")this.text=intext;
	}
	this.setuchk=function (inuchk){
		this.uchk=(true && inuchk);
	}
	this.setisok=function (inisok){
		this.isok=(true && inisok);
	}
}

function tilist(){
	this.ti=[];
	this.tx='t';
	this.danfen=1;
	this.shuoming='';
}

function dostlist(){ //初始化选题界面
	//1. 在数据初始化完成后初始化选题界面
	//2. 题目分类排列，题目选单显示状态有2种，a1-还未作答，a2-已作答
	$("#shijuan").html(sjName);
	var listhtml="";
	var n=stlist.length;
	var i=0;
	var sm='';
	var tmp='';
	for(i=0;i<n;i++){
		sm=stlist[i].shuoming
		listhtml=listhtml+"<div class='forlist' alt='"+sm+"' title='"+sm+"'>"+tx[stlist[i].tx]+"</div><ul class='alist'>";
		var k=stlist[i].ti.length;
		var j=0;
		//这里可以插入题序混乱处理
		if(config.tirand){
			//这里可以插入题序混乱处理(未完成)
			if(stlist[i].tx=='t4'){
				if(config.t4rand){
					stlist[i].ti.sort(myrand);
				}
			}else{
				stlist[i].ti.sort(myrand);
			}	
		}
		for(j=0;j<k;j++){
			tmp="T_"+i+"_"+j;
			daohan.push(tmp);
			listhtml=listhtml+"<li><a class='a1' href='#' id='"+tmp+"' onclick='selnum(\"T_"+i+"_"+j+"\")'>"+(j+1)+"</a></li>";	
			if(config.xrand){
				//这里插入选项混乱处理(未完成)
				if(stlist[i].ti[j].tx!="t3"){
					stlist[i].ti[j].awlist.sort(myrand);
				}
			}
		}
		listhtml=listhtml+"</ul>";
	}
	daoLength=daohan.length;
	$("#xlist").html(listhtml);
	$("#dibudaohang").html("<input type='button' title='前一题' id='Pbutton' onclick='preSel()' value='前一题' />&nbsp;<input type='button' title='后一题' id='Nbutton' onclick='nextSel()' value='后一题' />");
	$("#tijiao").html("<input type='button' title='提交并判断各题正误和统计总分' id=’TJbutton’ onclick='tijiao()' value='提交/判分' />");
	pdB();
}

function myrand(){
	return ((Math.random()>0.5)?1:-1);
}

function selnum(inNum){
	var oldNum=cuNum;
	cuNum=inNum;
	if(oldNum!=''){
 		obj=getNumTi(oldNum);
 		if (!(stlist[obj.i].ti[obj.j].issel)){
 			$("#"+oldNum).removeClass("a2").addClass("a1");
 		}
 	}
 	if(cuNum!=''){
 		$("#"+cuNum).removeClass("a1").addClass("a2");
 		var obj=getNumTi(cuNum);
 		var th=1+Number(obj.j);
 		var i=0;
 		$("#tihao").html(th);
 		var ti=stlist[obj.i].ti[obj.j];
 	
 		for(i=0;i<daohan.length;i++){
 			if(daohan[i]==cuNum) break;
 		}
 		daohanNum=i;
 		pdB();
 		ti.showme();
 	}	
}

function preSel(){
	daohanNum--;
	if(daohanNum<0){
		daohanNum=0;
		alert("已经是第一题！");
	}
	daohanSelNum(daohanNum);
}

function nextSel(){
	daohanNum++;
	if(daohanNum>=daohan.length){
		daohanNum=daohan.length-1;
		alert("已经是最后一题！");
	}
	daohanSelNum(daohanNum);
}

function daohanSelNum(inum){
	if(inum>-1 && inum<daohan.length){
		daohanNum=inum;
		selnum(daohan[daohanNum]);
	}
}

function getNumTi(inNum){
	var Tiobj={i:0,j:0};
	var tmpString=inNum.toString().split('_');
	Tiobj.i=tmpString[1];
	Tiobj.j=tmpString[2];
	return Tiobj;
}
//*/
$(document).ready(function(){
	$.ajax({
		url:config.xmlurl,
		dataType:'xml',
		success:function(data){
			sjName=$(data).find('shijuan').attr('title');
			$(data).find('list').each(function(){
				var $alist=$(this);
				var tlist=new tilist();
				tlist.danfen=Number($alist.attr('danfen'));
				tlist.tx=$alist.attr('class');
				tlist.shuoming=$alist.attr('shuoming');
				$alist.find('t').each(function(){
					var $axt=$(this);
					var tmpti=new xuanzeti();
					tmpti.fen=tlist.danfen;
					tmpti.tigan=$axt.find('tigan').text();
					tmpti.tx=$axt.attr('class');
					$axt.find('sl').each(function(){
						var $sl=$(this);
						var tmpaw=new xuanxiang();
						tmpaw.text=$sl.text();
						if($sl.attr('isok')=='undefined'){
							tmpaw.isok=false;
						}else if ($sl.attr('isok')=='1'){
							tmpaw.isok=true;
						}
						tmpaw.uchk=false;
						tmpti.awlist.push(tmpaw);
					});
					tlist.ti.push(tmpti);
				});
				stlist.push(tlist);
			});	
			dostlist();
		}	
	});//Xml数据获取和处理,输出到stlist对象中
})

