// Service worker : réception des notifications push ChefShift
self.addEventListener('push', function (e) {
  var data = {}
  try { data = e.data ? e.data.json() : {} } catch (err) {}
  e.waitUntil(
    self.registration.showNotification(data.title || 'ChefShift', {
      body: data.body || '',
      icon: '/icon.svg',
      badge: '/icon.svg',
      data: { url: data.url || '/dashboard' },
    })
  )
})

self.addEventListener('notificationclick', function (e) {
  e.notification.close()
  var url = (e.notification.data && e.notification.data.url) || '/dashboard'
  e.waitUntil(clients.openWindow(url))
})
