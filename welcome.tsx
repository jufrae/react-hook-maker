import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Главная" />
            <div className="wl-root">
                <div className="wl-inner">

                    <div className="wl-text">
                        <p className="wl-badge">Платформа бронирования</p>
                        <h1 className="wl-title">Конференции.РФ</h1>
                        <p className="wl-sub">Умное бронирование залов</p>

                        <p className="wl-desc">
                            Находите и бронируйте конференц-залы для мероприятий любого масштаба.
                            Быстро, удобно, с онлайн-оплатой.
                        </p>

                        <div className="wl-features">
                            <div className="wl-feat">
                                <span className="wl-feat-dot" />
                                <span>Широкий выбор залов и помещений</span>
                            </div>
                            <div className="wl-feat">
                                <span className="wl-feat-dot" />
                                <span>Онлайн-бронирование за несколько кликов</span>
                            </div>
                            <div className="wl-feat">
                                <span className="wl-feat-dot" />
                                <span>Личный кабинет с историей заказов</span>
                            </div>
                        </div>

                        <div className="wl-actions">
                            {auth.user ? (
                                <Link href={dashboard()} className="wl-btn wl-btn-primary">
                                    Перейти в кабинет →
                                </Link>
                            ) : (
                                <>
                                    <Link href={login()} className="wl-btn wl-btn-outline">
                                        Войти
                                    </Link>
                                    {canRegister && (
                                        <Link href={register()} className="wl-btn wl-btn-primary">
                                            Начать бесплатно →
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="wl-img-wrap">
                        <img
                            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80"
                            alt="Конференц-зал"
                            className="wl-img"
                        />
                    </div>

                </div>
            </div>
        </>
    );
}
