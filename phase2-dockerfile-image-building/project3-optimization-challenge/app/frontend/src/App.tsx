import React, { useEffect, useState } from 'react';

interface Item {
    id: number;
    name: string;
}

const App: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [health, setHealth] = useState<string>('');

    useEffect(() => {
        fetch('/api/data')
            .then(res => res.json())
            .then(data => setItems(data.items));

        fetch('/api/health')
            .then(res => res.json())
            .then(data => setHealth(data.status));
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Optimized Full-stack App</h1>
            <p>Health: {health}</p>
            <h2>Items:</h2>
            <ul>
                {items.map(item => (
                    <li key={item.id}>{item.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default App;// comment
