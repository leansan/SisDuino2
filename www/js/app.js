// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var app = angular.module('starter', ["ionic", "firebase"]);

app.run(function($ionicPlatform) {
  
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)

    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

app.config(function($stateProvider, $urlRouterProvider) {


  $stateProvider.state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  $stateProvider.state('app.home', {
    url: '/home',
    views: {
      'menuContent': {
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl'
      }
    }
  })    

  $stateProvider.state('app.configuracao', {
    url: '/configuracao',
    views: {
      'menuContent': {
        templateUrl: 'templates/configuracao.html',
        controller: 'ConfiguracaoCtrl'
      }
    }
  })    

  $urlRouterProvider.otherwise('/app/home');
});

app.controller("AppCtrl", function($scope, $firebaseObject, $firebaseAuth) {

});

app.controller("HomeCtrl", function($scope, $firebaseObject, $firebaseAuth, $rootScope) {
  // Cria os listeners dos dados no firebase
  var tempRef = db.ref('Temperatura');
  var umidRef = db.ref('Umidade');
  var lampRef = db.ref('Led');
  var valUdp = 2;

  _ip = $rootScope.configIp;

  // Registra as funções que atualizam os gráficos e dados atuais da telemetria
  tempRef.on('value', onNewData('currentTemp', 'tempLineChart' , 'Temperatura', 'C*'));
  umidRef.on('value', onNewData('currentUmid', 'umidLineChart' , 'Umidade', '%'));


  // Registrar função ao alterar valor da lampada
  var currentLampValue = false;
  lampRef.on('value', function(snapshot){
    var value = snapshot.val();
    var el = document.getElementById('currentLamp')
    if(value){
      el.classList.add('amber-text');
    }else{
      el.classList.remove('amber-text');
    }
    currentLampValue = !!value;
  });


  // Registrar função de click no botão de lampada
  var btnLamp = document.getElementById('btn-lamp');
  btnLamp.addEventListener('click', function(evt){
    lampRef.set(!currentLampValue);
    if(!currentLampValue == true){
      valUdp = 1;
      // alert("clicou no botao como true currentLampValue: " + currentLampValue + " valUdp "+ valUdp);
      
    } else if(!currentLampValue == false){
      valUdp = 2;
      // alert("clicou no botao como false currentLampValue: " + currentLampValue + " valUdp "+ valUdp);
      
    }


  });



  // Retorna uma função que de acordo com as mudanças dos dados
// Atualiza o valor atual do elemento, com a metrica passada (currentValueEl e metric)
// e monta o gráfico com os dados e descrição do tipo de dados (chartEl, label)
function onNewData(currentValueEl, chartEl, label, metric){
  return function(snapshot){
    var readings = snapshot.val();
    if(readings){
        var currentValue;
        var data = [];
        for(var key in readings){
          currentValue = readings[key]
          data.push(currentValue);
        }

        document.getElementById(currentValueEl).innerText = currentValue + ' ' + metric;
        buildLineChart(chartEl, label, data);
    }
  }
}




//codigo da porta udp


   $scope.sendcmd = function sendcmd(cmd) {
    //  alert("chamou a função cmd: " + cmd + " e porta: "+ valUdp);
    //  alert("Ip Usado: " + $rootScope.configIp + ":" + $rootScope.configPorta);
     if($rootScope.configIp==null ){
      alert("Atenção um Ip  devem se configurado");
     }
     if( $rootScope.configPorta==""){
      alert("Atenção uma  porta deve ser configurada");
     }
     
    //  var address = "192.168.43.122";
     var address = $rootScope.configIp;
      // var port = 4210;
     var port = $rootScope.configPorta;
     var data = new ArrayBuffer(cmd);
   
     chrome.sockets.udp.create({}, function (socketInfo) {
      // alert("entrou no create socketInfo " + socketInfo + " address "+ address);
       var socketId = socketInfo.socketId;
       chrome.sockets.udp.bind( socketId, "0.0.0.0", 49287, function (result) {
        // alert("entrou no bind result " + result);
         chrome.sockets.udp.getInfo( socketId, function(result){
          // alert("entrou no getInfo  " + getInfo + " com result " + result);
           console.log(result);
         });
   
         if(result < 0) {
          //  alert("ocorreu um erro: " + chrome.runtime.lastError.message);
         } else {
           chrome.sockets.udp.send( socketId, data, address, port, function (sendInfo) {
            // alert("entrou no send  " + sendInfo );
             if (sendInfo.resultCode < 0) {
              // alert("erro no send sendInfo.resultCode " + sendInfo.resultCode + " e  chrome.runtime.lastError.message: " + chrome.runtime.lastError.message );
               console.log(chrome.runtime.lastError.message);
             } else {
              // alert("sucesso no envio " + sendInfo);
               console.log(sendInfo);
             }
           });
         }
       });
     });
     
   };
   

});
  
app.controller("ConfiguracaoCtrl", function($scope, $firebaseObject, $rootScope) {
  $scope.salvarIp = function(_ip, _porta) {
    alert(_ip);
    $rootScope.configIp = _ip;
    $rootScope.configPorta = _porta;
    $scope.configIp = _ip;
    $scope.configPorta = _porta;
  }
  $scope.configIp =  $rootScope.configIp;
});