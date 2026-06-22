import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import App from '@/pages/main';
import { Carousel } from 'react-bootstrap';
import '/node_modules/bootstrap/dist/css/bootstrap.min.css';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Главная', href: dashboard() },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Кабинет" />
            <div className="dash-wrap">

                <div className="dash-carousel-box">
                    <Carousel>
                        <Carousel.Item interval={4000}>
                            <img
                                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
                                className="carousel-image"
                                alt="Конференц-залы"
                            />
                            <Carousel.Caption className="carousel-caption-custom">
                                <h2>Современные конференц-залы</h2>
                                <p>Оборудование для мероприятий любого масштаба</p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item interval={4000}>
                            <img
                                src="https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1200&q=80"
                                className="carousel-image"
                                alt="Деловые встречи"
                            />
                            <Carousel.Caption className="carousel-caption-custom">
                                <h2>Деловые встречи и переговоры</h2>
                                <p>Уютные переговорные комнаты для вашего бизнеса</p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item interval={4000}>
                            <img
                                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80"
                                className="carousel-image"
                                alt="Корпоративные события"
                            />
                            <Carousel.Caption className="carousel-caption-custom">
                                <h2>Корпоративные мероприятия</h2>
                                <p>Организация конференций, семинаров и тренингов</p>
                            </Carousel.Caption>
                        </Carousel.Item>
                    </Carousel>
                </div>

                <App />
            </div>
        </AppLayout>
    );
}
