'use client'

import { useEffect, useState } from 'react'
import { useT } from '@/lib/i18n'
import { Ico } from './Icons'

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

export default function PushSetup() {
  const { t } = useT()
  const [etat, setEtat] = useState<Etat>('chargement')
  const [envoi, setEnvoi] = useState(false)

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
          return
        }
        setEtat(Notification.permission === 'denied' ? 'refuse' : 'invite')
      })
      .catch(() => setEtat('indisponible'))
  }, [])

  async function activer() {
    setEnvoi(true)
    try {
      const cle = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string
      const reg = await navigator.serviceWorker.ready
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setEtat('refuse')
        setEnvoi(false)
        return
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(cle),
      })
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      })
      setEtat(res.ok ? 'actif' : 'invite')
    } catch {
      setEtat('invite')
    }
    setEnvoi(false)
  }

  if (etat === 'chargement' || etat === 'indisponible') return null

  if (etat === 'actif') {
    return (
      <div className="cs-fade cs-d2" style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24,
        background: '#f0f7ec', border: '1px solid #d9e8cf', borderRadius: 14, padding: '12px 18px',
        fontSize: 13.5, color: '#3d6b34', fontWeight: 700, fontFamily: FONT,
      }}>
        <Ico n="check" s={15} /> {t('push_ok')}
      </div>
    )
  }

  if (etat === 'refuse') {
    return (
      <div className="cs-fade cs-d2" style={{
        marginBottom: 24, background: '#fffdf4', border: '1px solid #efe7c8', borderRadius: 14,
        padding: '12px 18px', fontSize: 13.5, color: '#8a7320', fontWeight: 600, fontFamily: FONT,
      }}>
        {t('push_denied')}
      </div>
    )
  }

  return (
    <div className="cs-fade cs-d2" style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap',
      marginBottom: 24, background: '#fff', border: '1px solid #eceee3', borderRadius: 16,
      padding: '16px 20px', boxShadow: '0 3px 12px rgba(46,52,43,0.05)', fontFamily: FONT,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Ico n="bolt" s={18} c="#5f7052" />
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 800, color: '#23281f' }}>{t('push_title')}</div>
          <div style={{ fontSize: 13, color: '#6b7268' }}>{t('push_desc')}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={activer}
        disabled={envoi}
        className="cs-btn"
        style={{
          background: 'linear-gradient(135deg,#647a55,#46553c)', color: '#fff', border: 'none',
          borderRadius: 999, padding: '10px 20px', fontWeight: 700, fontSize: 13.5,
          cursor: envoi ? 'wait' : 'pointer', opacity: envoi ? 0.7 : 1, fontFamily: FONT,
        }}
      >
        {envoi ? t('form_loading') : t('push_btn')}
      </button>
    </div>
  )
}
