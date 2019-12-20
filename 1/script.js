$(document).ready(function(){
 
// ��������� ����� init, ����� �������� ����� �����:
chat.init();
 
});
 
var chat = {
 
// data �������� ���������� ��� ������������� � �������:
 
data : {
lastID : 0,
noActivity : 0
},
 
// Init ����������� ����������� ������� � ������������� �������:
 
init : function(){
 
// ���������� ������ jQuery defaultText, ���������� �����:
$('#name').defaultText('���������');
$('#email').defaultText('Email (������������ Gravatar)');
 
// ������������ div #chatLineHolder � jScrollPane,
// ��������� API ������� � chat.data:
 
chat.data.jspAPI = $('#chatLineHolder').jScrollPane({
verticalDragMinHeight: 12,
verticalDragMaxHeight: 12
}).data('jsp');
 
// ���������� ���������� working ��� ��������������
// ������������� �������� �����:
 
var working = false;
 
// ������������ ������� � ����:
 
$('#loginForm').submit(function(){
 
if(working) return false;
working = true;
 
// ���������� ���� ������� tzPOST
// (������������ �����):
 
$.tzPOST('login',$(this).serialize(),function(r){
working = false;
 
if(r.error){
chat.displayError(r.error);
}
else chat.login(r.name,r.gravatar);
});
 
return false;
});
// ���������� ������ ����� ������ ����:
 
$('#submitForm').submit(function(){
 
var text = $('#chatText').val();
 
if(text.length == 0){
return false;
}
 
if(working) return false;
working = true;
 
// ���������� ��������� ID ��� ����:
var tempID = 't'+Math.round(Math.random()*1000000),
params = {
id : tempID,
author : chat.data.name,
gravatar : chat.data.gravatar,
text : text.replace(/</g,'&lt;').replace(/>/g,'&gt;')
};
 
// ���������� ����� addChatLine, ����� �������� ��� �� �����
// ����������, �� ������ ���������� ������� AJAX:
 
chat.addChatLine($.extend({},params));
 
// ���������� ����� tzPOST, ����� ��������� ���
// ����� ������ POST AJAX:
 
$.tzPOST('submitChat',$(this).serialize(),function(r){
working = false;
 
$('#chatText').val('');
$('div.chat-'+tempID).remove();
 
params['id'] = r.insertID;
chat.addChatLine($.extend({},params));
});
 
return false;
});
 
// ��������� ������������:
 
$('a.logoutButton').live('click',function(){
 
$('#chatTopBar > span').fadeOut(function(){
$(this).remove();
});
 
$('#submitForm').fadeOut(function(){
$('#loginForm').fadeIn();
});
 
$.tzPOST('logout');
 
return false;
});
 
// ��������� ��������� ����������� ������������ (���������� ��������)
 
$.tzGET('checkLogged',function(r){
if(r.logged){
chat.login(r.loggedAs.name,r.loggedAs.gravatar);
}
});
 
// ����������������� ������� ��������
 
(function getChatsTimeoutFunction(){
chat.getChats(getChatsTimeoutFunction);
})();
 
(function getUsersTimeoutFunction(){
chat.getUsers(getUsersTimeoutFunction);
})();
 
},
// ����� login �������� ������ ����������� ������������
// � ������� ����� ����� ���������
 
login : function(name,gravatar){
 
chat.data.name = name;
chat.data.gravatar = gravatar;
$('#chatTopBar').html(chat.render('loginTopBar',chat.data));
 
$('#loginForm').fadeOut(function(){
$('#submitForm').fadeIn();
$('#chatText').focus();
});
 
},
 
// ����� render ���������� �������� HTML,
// ������� ����� ��� ������ �������:
 
render : function(template,params){
 
var arr = [];
switch(template){
case 'loginTopBar':
arr = [
'<span><img src="',params.gravatar,'" width="23" height="23" />',
'<span>',params.name,
'</span><a href="">�����</a></span>'];
break;
 
case 'chatLine':
arr = [
'<div><span><img src="',params.gravatar,
'" width="23" height="23" onload="this.style.visibility=\'visible\'" />','</span><span>',params.author,
':</span><span>',params.text,'</span><span>',params.time,'</span></div>'];
break;
 
case 'user':
arr = [
'<div title="',params.name,'"><img src="',
params.gravatar,'" width="30" height="30" onload="this.style.visibility=\'visible\'" /></div>'
];
break;
}
 
// ������������ ����� join ��� ������� �����������
// �������, ��� ������������� ������� �����
 
return arr.join('');
 
},
// ����� addChatLine ��������� ������ ���� �� ��������
 
addChatLine : function(params){
 
// ��� ��������� ������� ��������� � ������� ���������� ����� ������������
 
var d = new Date();
if(params.time) {
 
// PHP ���������� ����� � ������� UTC (GMT). �� ���������� ��� ��� ������������ ������� date
// � ����������� ������ � ������� ���������� ����� ������������.
// JavaScript ������������ ��� ��� ���.
 
d.setUTCHours(params.time.hours,params.time.minutes);
}
 
params.time = (d.getHours() < 10 ? '0' : '' ) + d.getHours()+':'+
(d.getMinutes() < 10 ? '0':'') + d.getMinutes();
 
var markup = chat.render('chatLine',params),
exists = $('#chatLineHolder .chat-'+params.id);
 
if(exists.length){
exists.remove();
}
 
if(!chat.data.lastID){
// ���� ��� ������ ������ � ����, �������
// �������� � ���������� � ���, ��� ��� ������ �� ��������:
 
$('#chatLineHolder p').remove();
}
 
// ���� ��� �� ��������� ������ ����:
if(params.id.toString().charAt(0) != 't'){
var previous = $('#chatLineHolder .chat-'+(+params.id - 1));
if(previous.length){
previous.after(markup);
}
else chat.data.jspAPI.getContentPane().append(markup);
}
else chat.data.jspAPI.getContentPane().append(markup);
 
// ��� ��� �� �������� ����� �������, �����
// ����� ���������������� ������ jScrollPane:
 
chat.data.jspAPI.reinitialise();
chat.data.jspAPI.scrollToBottom(true);
 
},
// ������ ����� ����������� ��������� ������ � ����
// (������� � lastID), � ��������� �� �� ��������.
 
getChats : function(callback){
$.tzGET('getChats',{lastID: chat.data.lastID},function(r){
 
for(var i=0;i<r.chats.length;i++){
chat.addChatLine(r.chats[i]);
}
 
if(r.chats.length){
chat.data.noActivity = 0;
chat.data.lastID = r.chats[i-1].id;
}
else{
// ���� ��� ������� � ����, �����������
// ������� noActivity.
 
chat.data.noActivity++;
}
 
if(!chat.data.lastID){
chat.data.jspAPI.getContentPane().html('<p>������ ��� �� ��������</p>');
}
 
// ������������� ������� ��� ���������� �������
// � ����������� ���������� ����:
 
var nextRequest = 1000;
 
// 2 �������
if(chat.data.noActivity > 3){
nextRequest = 2000;
}
 
if(chat.data.noActivity > 10){
nextRequest = 5000;
}
 
// 15 ������
if(chat.data.noActivity > 20){
nextRequest = 15000;
}
 
setTimeout(callback,nextRequest);
});
},
 
// ������ ������ ���� �������������.
 
getUsers : function(callback){
$.tzGET('getUsers',function(r){
 
var users = [];
 
for(var i=0; i< r.users.length;i++){
if(r.users[i]){
users.push(chat.render('user',r.users[i]));
}
}
 
var message = '';
 
if(r.total<1){
message = '������ ��� � �������';
}
else {
message = '� �������: ' + r.total;
}
 
users.push('<p>'+message+'</p>');
 
$('#chatUsers').html(users.join(''));
 
setTimeout(callback,15000);
});
},
// ������ ����� ������� ��������� �� ������ ������� ��������:
 
displayError : function(msg){
var elem = $('<div>',{
id : 'chatErrorMessage',
html : msg
});
 
elem.click(function(){
$(this).fadeOut(function(){
$(this).remove();
});
});
 
setTimeout(function(){
elem.click();
},5000);
 
elem.hide().appendTo('body').slideDown();
}
};
 
// ������������ GET & POST:
 
$.tzPOST = function(action,data,callback){
$.post('php/ajax.php?action='+action,data,callback,'json');
}
 
$.tzGET = function(action,data,callback){
$.get('php/ajax.php?action='+action,data,callback,'json');
}
 
// ����� jQuery ��� ����������� ������:
 
$.fn.defaultText = function(value){
 
var element = this.eq(0);
element.data('defaultText',value);
 
element.focus(function(){
if(element.val() == value){
element.val('').removeClass('defaultText');
}
}).blur(function(){
if(element.val() == '' || element.val() == value){
element.addClass('defaultText').val(value);
}
});
 
return element.blur();
}