'use client'

import { useEffect, useState } from 'react'
import { AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js'
import { userPool } from '@/lib/cognito'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [mfaRequired, setMfaRequired] = useState(false)
  const [mfaCode, setMfaCode] = useState('')
  const [cognitoUser, setCognitoUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('idToken')
    if (token) window.location.href = '/'
  }, [])

  const saveSession = (session: any) => {
    localStorage.setItem('idToken', session.getIdToken().getJwtToken())
    localStorage.setItem('accessToken', session.getAccessToken().getJwtToken())
    localStorage.setItem('refreshToken', session.getRefreshToken().getToken())
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const authDetails = new AuthenticationDetails({ Username: email, Password: password })
    const user = new CognitoUser({ Username: email, Pool: userPool })

    user.authenticateUser(authDetails, {
      onSuccess: (session) => {
        saveSession(session)
        window.location.href = '/'
      },
      onFailure: (err) => setError(err.message || 'Đăng nhập thất bại'),
      mfaRequired: () => {
        setCognitoUser(user)
        setMfaRequired(true)
      },
    })
  }

  const handleVerifyMFA = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cognitoUser) return

    cognitoUser.sendMFACode(mfaCode, {
      onSuccess: (session: any) => {
        saveSession(session)
        window.location.href = '/'
      },
      onFailure: (err: any) => setError(err.message || 'MFA thất bại'),
    })
  }

  return (
    <div style={styles.container}>
      <form onSubmit={mfaRequired ? handleVerifyMFA : handleLogin} style={styles.form}>
        <h2>{mfaRequired ? 'Nhập mã MFA' : 'Login'}</h2>
        {error && <p style={styles.error}>{error}</p>}

        {!mfaRequired ? (
          <>
            <input style={styles.input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input style={styles.input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </>
        ) : (
          <input style={styles.input} type="text" placeholder="Nhập mã MFA" value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} required />
        )}

        <button style={styles.button} type="submit">{mfaRequired ? 'Xác nhận' : 'Login'}</button>

        {!mfaRequired && (
          <p style={styles.link} onClick={() => (window.location.href = '/register')}>Chưa có tài khoản? Đăng ký</p>
        )}
      </form>
    </div>
  )
}

const styles: any = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f3f4f6' },
  form: { width: '350px', padding: '30px', borderRadius: '10px', background: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', textAlign: 'center' },
  input: { width: '100%', padding: '12px', margin: '10px 0', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' },
  button: { width: '100%', padding: '12px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px' },
  error: { color: 'red', marginBottom: '10px' },
  link: { marginTop: 10, cursor: 'pointer', color: '#0070f3' },
}
