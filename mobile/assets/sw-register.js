if ('serviceWorker' in navigator && location.hostname !== 'localhost') {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('Service Worker registrado:', registration.scope);
      })
      .catch(function(error) {
        console.log('Error al registrar Service Worker:', error);
      });
  });
}
