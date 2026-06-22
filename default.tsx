import { useEffect, useState } from 'react'

interface Item {
    id: number
    name: string
    type: string
    price: number
    capacity: number
}

function App() {
    const [items, setItems] = useState<{ items: Item[] }>()
    const [selected, setSelected] = useState<Item | null>(null)

    useEffect(() => {
        fetch('/items')
            .then(r => r.json())
            .then(data => setItems(data))
            .catch(console.error)
    }, [])

    if (!items) {
        return (
            <div className="cat-root">
                <div className="t-spinner" />
            </div>
        )
    }

    return (
        <div className="cat-root">

            <div className="cat-hero">
                <h1 className="cat-hero-title">Каталог залов</h1>
                <p className="cat-hero-sub">Выберите подходящий зал и оформите бронирование онлайн</p>

                <div className="cat-feats">
                    <div className="cat-feat">
                        <span className="cat-feat-icon">✓</span>
                        <span>Мгновенное бронирование</span>
                    </div>
                    <div className="cat-feat">
                        <span className="cat-feat-icon">✓</span>
                        <span>Залы разной вместимости</span>
                    </div>
                    <div className="cat-feat">
                        <span className="cat-feat-icon">✓</span>
                        <span>Прозрачные цены</span>
                    </div>
                </div>
            </div>

            <h2 className="cat-grid-title">Доступные залы</h2>
            <div className="cat-grid">
                {items.items.map(item => (
                    <div key={item.id} className="cat-card">
                        <img
                            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80"
                            alt={item.name}
                            className="cat-card-img"
                        />
                        <div className="cat-card-body">
                            <p className="cat-card-type">{item.type}</p>
                            <h3 className="cat-card-name">{item.name}</h3>
                            <div className="cat-card-meta">
                                <span className="cat-card-cap">До {item.capacity} чел.</span>
                                <span className="cat-card-price">{item.price} ₽</span>
                            </div>
                            <button className="t-btn t-btn-primary cat-card-btn" onClick={() => setSelected(item)}>
                                Оформить заявку
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {selected && (
                <OrderModal item={selected} onClose={() => setSelected(null)} />
            )}
        </div>
    )
}

function OrderModal({ item, onClose }: { item: Item; onClose: () => void }) {
    const [form, setForm] = useState({
        item_id: item.id,
        payment_type: '',
        date: '',
        status: 'Новая',
    })
    const [submitting, setSubmitting] = useState(false)

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    async function handleSubmit() {
        setSubmitting(true)
        try {
            const res = await fetch('/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            if (!res.ok) throw new Error()
            const data = await res.json()
            if (data.redirect) window.location.href = data.redirect
            onClose()
        } catch {
            alert('Не удалось оформить заявку')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="t-overlay" onClick={onClose}>
            <div className="t-modal" onClick={e => e.stopPropagation()}>
                <button className="t-modal-close" onClick={onClose}>✕</button>
                <h3 className="t-modal-title">Оформление заявки</h3>

                <div className="t-summary">
                    <div className="t-summary-row">
                        <span>Объект</span>
                        <span>{item.name}</span>
                    </div>
                    <div className="t-summary-row">
                        <span>Тип</span>
                        <span>{item.type}</span>
                    </div>
                    <div className="t-summary-row">
                        <span>Вместимость</span>
                        <span>{item.capacity} чел.</span>
                    </div>
                    <div className="t-summary-row">
                        <span>Стоимость</span>
                        <span>{item.price} ₽</span>
                    </div>
                </div>

                <div className="t-field">
                    <label className="t-field-label">Дата</label>
                    <input
                        className="t-input"
                        type="date"
                        name="date"
                        onChange={handleChange}
                        disabled={submitting}
                        required
                    />
                </div>

                <div className="t-field">
                    <label className="t-field-label">Способ оплаты</label>
                    <select className="t-input" name="payment_type" onChange={handleChange} disabled={submitting} defaultValue="">
                        <option value="" disabled>Выберите способ</option>
                        <option value="По карте">По карте</option>
                        <option value="По номеру телефона">По номеру телефона</option>
                    </select>
                </div>

                <div className="t-modal-actions">
                    <button className="t-btn t-btn-primary" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Оформление...' : 'Подтвердить'}
                    </button>
                    <button className="t-btn t-btn-ghost" onClick={onClose} disabled={submitting}>
                        Отмена
                    </button>
                </div>
            </div>
        </div>
    )
}

export default App
