import { useEffect, useState } from 'react'

interface Order {
    id: number
    item_name: string
    item_type: string
    price: string
    payment_type: 'По карте' | 'По номеру телефона'
    date: string
    status: 'Новая' | 'В обработке' | 'Завершена'
}

interface Review {
    name: string
    review: string
    rating: string
    order_id: number
}

interface UserType {
    user_type: 'user' | 'admin'
}

function App() {
    const [type, setType] = useState<UserType>({ user_type: 'user' })

    useEffect(() => {
        fetch('/type')
            .then(r => r.json())
            .then(data => setType(data))
            .catch(console.error)
    }, [])

    return type.user_type === 'admin' ? <Admin /> : <User />
}

function User() {
    const [orders, setOrders] = useState<{ orders: Order[] }>()
    const [reviews, setReviews] = useState<Review[]>([])
    const [reviewModalOrderId, setReviewModalOrderId] = useState<number | null>(null)

    useEffect(() => {
        Promise.all([fetch('/orders'), fetch('/reviews')])
            .then(async ([oRes, rRes]) => {
                if (!oRes.ok || !rRes.ok) throw new Error()
                const [oData, rData] = await Promise.all([oRes.json(), rRes.json()])
                setOrders(oData)
                setReviews(rData.reviews)
            })
            .catch(console.error)
    }, [])

    function refreshReviews() {
        fetch('/reviews')
            .then(r => r.json())
            .then(data => setReviews(data.reviews))
            .catch(console.error)
    }

    function statusClass(status: string) {
        const map: Record<string, string> = {
            'Новая':       'badge-warning',
            'В обработке': 'badge-info',
            'Завершена':   'badge-success',
        }
        return map[status] ?? 'badge-default'
    }

    if (!orders) {
        return (
            <div className="t-section">
                <div className="t-spinner" />
            </div>
        )
    }

    if (orders.orders.length === 0) {
        return (
            <div className="t-section">
                <div className="t-empty">
                    <p className="t-empty-title">Заявок пока нет</p>
                    <p className="t-empty-sub">Перейдите в <a href="/catalog">каталог</a>, чтобы оформить первую заявку</p>
                </div>
            </div>
        )
    }

    return (
        <div className="t-section">
            <div className="t-section-header">
                <h2 className="t-section-title">Мои бронирования</h2>
                <p className="t-section-sub">История ваших заявок и их статусы</p>
            </div>

            <div className="t-orders-grid">
                {orders.orders.map((order) => {
                    const review = reviews.find(r => r.order_id === order.id)
                    return (
                        <div key={order.id} className="t-order-card">
                            <div className="t-order-head">
                                <span className="t-order-id">Заявка #{order.id}</span>
                                <span className={`t-badge ${statusClass(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="t-order-body">
                                <div className="t-row">
                                    <span className="t-label">Дата</span>
                                    <span className="t-value">{order.date}</span>
                                </div>
                                <div className="t-row">
                                    <span className="t-label">Объект</span>
                                    <span className="t-value t-value-primary">{order.item_name}</span>
                                </div>
                                <div className="t-row">
                                    <span className="t-label">Тип</span>
                                    <span className="t-value">{order.item_type}</span>
                                </div>
                                <div className="t-row">
                                    <span className="t-label">Стоимость</span>
                                    <span className="t-value t-value-green">{order.price} ₽</span>
                                </div>
                                <div className="t-row">
                                    <span className="t-label">Оплата</span>
                                    <span className="t-value">{order.payment_type}</span>
                                </div>

                                {review && (
                                    <div className="t-review-box">
                                        <div className="t-review-stars">
                                            {[1,2,3,4,5].map(s => (
                                                <span key={s} className={parseInt(review.rating) >= s ? 'star-on' : 'star-off'}>★</span>
                                            ))}
                                        </div>
                                        <p className="t-review-text">{review.review}</p>
                                    </div>
                                )}
                            </div>

                            {order.status === 'Завершена' && !review && (
                                <div className="t-order-foot">
                                    <button className="t-btn t-btn-outline" onClick={() => setReviewModalOrderId(order.id)}>
                                        Оставить отзыв
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {reviewModalOrderId !== null && (
                <ReviewModal
                    orderId={reviewModalOrderId}
                    onClose={() => { setReviewModalOrderId(null); refreshReviews() }}
                />
            )}
        </div>
    )
}

function ReviewModal({ orderId, onClose }: { orderId: number; onClose: () => void }) {
    const [rating, setRating] = useState('')
    const [review, setReview] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!rating) { setMsg({ ok: false, text: 'Выберите оценку' }); return }
        if (!review.trim()) { setMsg({ ok: false, text: 'Напишите отзыв' }); return }

        setSubmitting(true)
        try {
            const res = await fetch('/postReview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: orderId, rating, review }),
            })
            if (!res.ok) throw new Error()
            setMsg({ ok: true, text: 'Отзыв отправлен!' })
            setTimeout(onClose, 1500)
        } catch {
            setMsg({ ok: false, text: 'Ошибка отправки. Попробуйте снова.' })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="t-overlay" onClick={onClose}>
            <div className="t-modal" onClick={e => e.stopPropagation()}>
                <button className="t-modal-close" onClick={onClose}>✕</button>
                <h3 className="t-modal-title">Оставьте отзыв</h3>

                {msg && <div className={`t-alert ${msg.ok ? 't-alert-ok' : 't-alert-err'}`}>{msg.text}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="t-field">
                        <label className="t-field-label">Оценка</label>
                        <div className="t-rating">
                            {[1,2,3,4,5].map(n => (
                                <label key={n} className={`t-rating-btn ${rating === String(n) ? 'selected' : ''}`}>
                                    <input type="radio" name="rating" value={n} hidden onChange={e => setRating(e.target.value)} />
                                    {n}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="t-field">
                        <label className="t-field-label">Отзыв</label>
                        <textarea
                            className="t-input"
                            rows={4}
                            value={review}
                            onChange={e => setReview(e.target.value)}
                            placeholder="Напишите ваш отзыв..."
                            disabled={submitting}
                        />
                    </div>
                    <div className="t-modal-actions">
                        <button className="t-btn t-btn-primary" type="submit" disabled={submitting}>
                            {submitting ? 'Отправка...' : 'Отправить'}
                        </button>
                        <button className="t-btn t-btn-ghost" type="button" onClick={onClose} disabled={submitting}>
                            Отмена
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function Admin() {
    const [orders, setOrders] = useState<{ orders: Order[] }>()
    const [loading, setLoading] = useState<number | null>(null)

    useEffect(() => {
        fetch('/Aorders')
            .then(r => r.json())
            .then(data => setOrders(data))
            .catch(console.error)
    }, [])

    async function advance(orderId: number, currentStatus: string) {
        if (loading === orderId) return
        setLoading(orderId)
        try {
            const res = await fetch('/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: orderId, status: currentStatus }),
            })
            if (!res.ok) throw new Error()
            const data = await res.json()

            if (data.success) {
                const next: Record<string, string> = {
                    'Новая':       'В обработке',
                    'В обработке': 'Завершена',
                }
                setOrders(prev => prev && ({
                    orders: prev.orders.map(o =>
                        o.id === orderId ? { ...o, status: next[o.status] as Order['status'] } : o
                    )
                }))
            }
        } catch {
            alert('Не удалось обновить статус')
        } finally {
            setLoading(null)
        }
    }

    function statusClass(status: string) {
        const map: Record<string, string> = {
            'Новая':       'badge-warning',
            'В обработке': 'badge-info',
            'Завершена':   'badge-success',
        }
        return map[status] ?? 'badge-default'
    }

    function advanceBtnLabel(status: string) {
        const map: Record<string, string> = {
            'Новая':       'Принять заявку',
            'В обработке': 'Завершить',
        }
        return map[status] ?? ''
    }

    if (!orders) {
        return <div className="t-section"><div className="t-spinner" /></div>
    }

    return (
        <div className="t-section">
            <div className="t-section-header">
                <h2 className="t-section-title">Панель администратора</h2>
                <p className="t-section-sub">Управление заявками</p>
            </div>

            <div className="t-stats">
                <div className="t-stat-card">
                    <span className="t-stat-num">{orders.orders.length}</span>
                    <span className="t-stat-label">Всего заявок</span>
                </div>
                <div className="t-stat-card">
                    <span className="t-stat-num">{orders.orders.filter(o => o.status === 'Новая').length}</span>
                    <span className="t-stat-label">Новых</span>
                </div>
                <div className="t-stat-card">
                    <span className="t-stat-num">{orders.orders.filter(o => o.status === 'В обработке').length}</span>
                    <span className="t-stat-label">В обработке</span>
                </div>
                <div className="t-stat-card">
                    <span className="t-stat-num">{orders.orders.filter(o => o.status === 'Завершена').length}</span>
                    <span className="t-stat-label">Завершено</span>
                </div>
            </div>

            <div className="t-orders-grid">
                {orders.orders.map(order => (
                    <div key={order.id} className="t-order-card">
                        <div className="t-order-head">
                            <span className="t-order-id">Заявка #{order.id}</span>
                            <span className={`t-badge ${statusClass(order.status)}`}>
                                {order.status}
                            </span>
                        </div>

                        <div className="t-order-body">
                            <div className="t-row">
                                <span className="t-label">Дата</span>
                                <span className="t-value">{order.date}</span>
                            </div>
                            <div className="t-row">
                                <span className="t-label">Объект</span>
                                <span className="t-value t-value-primary">{order.item_name}</span>
                            </div>
                            <div className="t-row">
                                <span className="t-label">Тип</span>
                                <span className="t-value">{order.item_type}</span>
                            </div>
                            <div className="t-row">
                                <span className="t-label">Стоимость</span>
                                <span className="t-value t-value-green">{order.price} ₽</span>
                            </div>
                            <div className="t-row">
                                <span className="t-label">Оплата</span>
                                <span className="t-value">{order.payment_type}</span>
                            </div>
                        </div>

                        <div className="t-order-foot">
                            {order.status !== 'Завершена' ? (
                                <button
                                    className="t-btn t-btn-primary"
                                    onClick={() => advance(order.id, order.status)}
                                    disabled={loading === order.id}
                                >
                                    {loading === order.id ? 'Обновление...' : advanceBtnLabel(order.status)}
                                </button>
                            ) : (
                                <button className="t-btn t-btn-ghost" disabled>
                                    Завершена
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default App
