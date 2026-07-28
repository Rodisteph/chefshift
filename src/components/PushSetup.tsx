'use client'

import { useEffect, useState } from 'react'
import { useT } from '@/lib/i18n'
import { Ico, IcoTile } from './Icons'

const FONT = '"Sora","Inter","Helvetica Neue",Arial,sans-serif'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) {
    arr[i] = raw.charCodeAt(i)
  }
  return arr
}

type Etat = 'chargement' | 'invite' | 'actif' | 'refuse' | 'indisponible'

function Interrupteur({ on, onClick, disabled }: { on: boolean; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={on}
      style={{
        width: 54, height: 31, borderRadius: 999, border: 'none', flexShrink: 0,
        cursor: disabled ? 'wait' : 'pointer',
        background: on ? '#5f7052' : '#d5d0c4',
        position: 'relative', transition: 'background .25s ease',
      }}
    >
      <span
        style={{
          position: 'absolute', top: 3, left: on ? 26 : 3, width: 25, height: 25,
          borderRadius: '50%', background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,.28)', transition: 'left .25s ease',
        }}
      />
    </button>
  )
}

export default function PushSetup() {
  const { t } = useT()
  const [etat, setEtat] = useState<Etat>('chargement')
  const [envoi, setEnvoi] = useState(false)
  const [testEnvoi, setTestEnvoi] = useState(false)
  const [testMsg, setTestMsg] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setEtat('indisponible')
      return
    }
    const cle = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!cle) {
      setEtat('indisponible')
      return
    }
    navigator.serviceWorker
      .register('/sw.js')
      .then(async (reg) => {
        const sub = await reg.pushManager.getSubscription()
        if (sub) {
          setEtat('actif')
          // Resynchronise l'abonnement du navigateur avec le serveur :
          // évite un « no subscription » si la base ne connaît pas (ou plus) cet endpoint.
          fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription: sub.toJSON() }),
          }).catch(() => {})
          return
        }
        setEtat(Notification.permission === 'denied' ? 'refuse' : 'invite')
      })
      .catch(() => setEtat('indisponible'))
  }, [])

  // (Ré)abonne le navigateur et enregistre l'abonnement côté serveur.
  // force = true : on jette l'abonnement local d'abord pour repartir d'un endpoint frais
  // (utile quand l'abonnement stocké a expiré = erreur 410).
  async function sabonner(force = false): Promise<boolean> {
    const cle = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string | undefined
    if (!cle) return false
    const reg = await navigator.serviceWorker.ready
    if (force) {
      const existante = await reg.pushManager.getSubscription()
      if (existante) {
        try { await existante.unsubscribe() } catch {}
      }
    }
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return false
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(cle),
    })
    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub.toJSON() }),
    })
    return res.ok
  }

  async function activer() {
    setEnvoi(true)
    try {
      const ok = await sabonner(false)
      if (ok) setEtat('actif')
      else setEtat(Notification.permission === 'denied' ? 'refuse' : 'invite')
    } catch {
      setEtat('invite')
    }
    setEnvoi(false)
  }

  async function desactiver() {
    setEnvoi(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setEtat('invite')
      setTestMsg('')
    } catch {}
    setEnvoi(false)
  }

  async function tester() {
    setTestEnvoi(true)
    setTestMsg('')
    try {
      let res = await fetch('/api/push/test', { method: 'POST' })
      let data = await res.json()

      // Abonnement périmé/absent côté serveur (ex. erreur 410) :
      // on se réabonne silencieusement avec un endpoint frais, puis on réessaie une fois.
      if (!data.ok && (data.code === 'stale' || data.code === 'no_subscription')) {
        const ok = await sabonner(true)
        if (ok) {
          res = await fetch('/api/push/test', { method: 'POST' })
          data = await res.json()
        }
      }

      setTestMsg(data.ok ? t('push_test_sent') : t('push_test_none'))
    } catch {
      setTestMsg(t('push_test_none'))
    }
    setTestEnvoi(false)
  }

  const carte: React.CSSProperties = {
    marginBottom: 24, background: '#fff', border: '1px solid #eceee3', borderRadius: 16,
    padding: '16px 20px', boxShadow: '0 3px 12px rgba(46,52,43,0.05)', fontFamily: FONT,
  }

  if (etat === 'chargement') {
    return (
      <div className="cs-fade cs-d2" style={{ ...carte, color: '#6b7268', fontSize: 13.5, fontWeight: 600 }}>
        {t('dash_loading')}
      </div>
    )
  }

  if (etat === 'indisponible') {
    return (
      <div className="cs-fade cs-d2" style={{ ...carte, display: 'flex', alignItems: 'center', gap: 12 }}>
        <IcoTile n="bell" s={16} taille={38} />
        <div style={{ fontSize: 13.5, color: '#9aa39b', fontWeight: 600 }}>{t('push_unsupported')}</div>
      </div>
    )
  }

  if (etat === 'refuse') {
    return (
      <div className="cs-fade cs-d2" style={{
        marginBottom: 24, background: '#fffdf4', border: '1px solid #efe7c8', borderRadius: 16,
        padding: '16px 20px', fontSize: 13.5, color: '#8a7320', fontWeight: 600, fontFamily: FONT,
        display: 'flex', alignItems: 'flex-start', gap: 12,
      }}>
        <Ico n="bell" s={17} c="#8a7320" />
        <span>{t('push_denied')}</span>
      </div>
    )
  }

  const actif = etat === 'actif'

  return (
    <div className="cs-fade cs-d2" style={carte}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <IcoTile n="bell" s={16} taille={38} />
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: '#23281f', display: 'flex', alignItems: 'center', gap: 8 }}>
              {t('push_title')}
              <span style={{
                fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 999,
                background: actif ? '#dcfce7' : '#f1f0eb',
                color: actif ? '#15803d' : '#8a8676',
                textTransform: 'uppercase', letterSpacing: 0.8,
              }}>
                {actif ? t('push_state_on') : t('push_state_off')}
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#6b7268', marginTop: 3 }}>
              {actif ? t('push_ok') : t('push_desc')}
            </div>
          </div>
        </div>
        <Interrupteur on={actif} onClick={actif ? desactiver : activer} disabled={envoi} />
      </div>
      {actif && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, paddingLeft: 50, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={tester}
            disabled={testEnvoi}
            className="cs-btn"
            style={{
              background: 'none', border: '1.5px solid #b9d3a8', borderRadius: 999,
              padding: '7px 16px', fontWeight: 700, fontSize: 12.5, cursor: testEnvoi ? 'wait' : 'pointer',
              color: '#3d6b34', fontFamily: FONT,
            }}
          >
            {testEnvoi ? t('form_loading') : t('push_test')}
          </button>
          {testMsg && <span style={{ fontWeight: 600, fontSize: 12.5, color: '#3d6b34' }}>{testMsg}</span>}
        </div>
      )}
    </div>
  )
}
