
var app = angular.module('starter', ["ionic", "firebase"]);

app.run(function($ionicPlatform) {
  
  $ionicPlatform.ready(function() {

    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
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

  //pega o ip que eu informar na configuração, esse ip vem do arduino/NodeMcu.
  _ip = $rootScope.configIp;

  // Registra as funções que atualizam os gráficos e dados atuais da telemetria
  tempRef.on('value', onNewData('currentTemp', 'tempLineChart' , 'Temperatura', 'C*'));
  umidRef.on('value', onNewData('currentUmid', 'umidLineChart' , 'Umidade', '%'));


  // Registrar função ao alterar valor da lampada (Experimental)
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


  // Registrar função de click no botão de lampada (Experimental)
  var btnLamp = document.getElementById('btn-lamp');
  btnLamp.addEventListener('click', function(evt){
    lampRef.set(!currentLampValue);
    if(!currentLampValue == true){
      valUdp = 1;
    
    } else if(!currentLampValue == false){
      valUdp = 2;

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




//Função UDP, essa é a parte mais importante, aqui é feito o envio de dados para uma porta especifica via protocolo UDP
   $scope.sendcmd = function sendcmd(cmd) {
     if($rootScope.configIp==null ){
      alert("Atenção um Ip  devem se configurado");
     }
     if( $rootScope.configPorta==""){
      alert("Atenção uma  porta deve ser configurada");
     }
     

     var address = $rootScope.configIp;
     var port = $rootScope.configPorta;
     var data = new ArrayBuffer(cmd);
   
     chrome.sockets.udp.create({}, function (socketInfo) {

       var socketId = socketInfo.socketId;
       chrome.sockets.udp.bind( socketId, "0.0.0.0", 49287, function (result) {
         chrome.sockets.udp.getInfo( socketId, function(result){
           console.log(result);
         });
   
         if(result < 0) {

         } else {
           chrome.sockets.udp.send( socketId, data, address, port, function (sendInfo) {
             if (sendInfo.resultCode < 0) {
               console.log(chrome.runtime.lastError.message);
             } else {
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