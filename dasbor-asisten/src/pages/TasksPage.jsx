// src/pages/TasksPage.jsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './TasksPage.css';
// 
// ⬇️ PERUBAHAN UTAMA ADA DI BARIS INI ⬇️
//
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
//
// ⬆️ KITA MENGGUNAKAN @hello-pangea/dnd, BUKAN react-beautiful-dnd ⬆️
//

function TasksPage() {
    // State untuk menyimpan kolom dan tugas di dalamnya
    const [columns, setColumns] = useState({
        'To-Do': { id: 'To-Do', title: 'To-Do', tasks: [] },
        'In-Progress': { id: 'In-Progress', title: 'In-Progress', tasks: [] },
        'Done': { id: 'Done', title: 'Done', tasks: [] },
    });
    const [loading, setLoading] = useState(true);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    // Ambil semua tugas saat halaman dimuat
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                setLoading(true);
                const response = await api.get('/tasks');
                const tasks = response.data;
                
                // Distribusikan tugas ke kolom yang sesuai
                const newColumns = {
                    'To-Do': { id: 'To-Do', title: 'To-Do', tasks: tasks.filter(t => t.status === 'To-Do') },
                    'In-Progress': { id: 'In-Progress', title: 'In-Progress', tasks: tasks.filter(t => t.status === 'In-Progress') },
                    'Done': { id: 'Done', title: 'Done', tasks: tasks.filter(t => t.status === 'Done') },
                };
                setColumns(newColumns);

            } catch (error) {
                console.error("Gagal mengambil tugas:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    // Fungsi untuk menambah tugas baru
    const handleAddTask = async (e) => {
        e.preventDefault();
        if (newTaskTitle.trim() === '') return;
        
        try {
            const newTask = { title: newTaskTitle, status: 'To-Do' };
            const response = await api.post('/tasks', newTask); // Panggil API
            const createdTask = response.data;

            // Tambahkan tugas baru ke kolom 'To-Do' di state
            setColumns(prevColumns => ({
                ...prevColumns,
                'To-Do': {
                    ...prevColumns['To-Do'],
                    tasks: [createdTask, ...prevColumns['To-Do'].tasks]
                }
            }));
            
            setNewTaskTitle(''); // Kosongkan input
        } catch (error) {
            console.error("Gagal menambah tugas:", error);
        }
    };

    // Fungsi yang menangani logika setelah drag selesai
    const onDragEnd = (result) => {
        const { source, destination, draggableId } = result;

        // 1. Jika di-drop di luar area yang valid
        if (!destination) return;

        // 2. Jika di-drop di tempat yang sama
        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        const startColumn = columns[source.droppableId];
        const endColumn = columns[destination.droppableId];

        // 3. Jika pindah di dalam kolom yang sama
        if (startColumn === endColumn) {
            const newTasks = Array.from(startColumn.tasks);
            const [movedTask] = newTasks.splice(source.index, 1); // Ambil task
            newTasks.splice(destination.index, 0, movedTask); // Masukkan ke posisi baru

            setColumns(prev => ({
                ...prev,
                [startColumn.id]: {
                    ...startColumn,
                    tasks: newTasks
                }
            }));
            return;
        }

        // 4. Jika pindah ke kolom yang berbeda
        const startTasks = Array.from(startColumn.tasks);
        const [movedTask] = startTasks.splice(source.index, 1); // Hapus dari kolom asal
        
        const endTasks = Array.from(endColumn.tasks);
        endTasks.splice(destination.index, 0, movedTask); // Masukkan ke kolom tujuan

        // Update state
        setColumns(prev => ({
            ...prev,
            [startColumn.id]: { ...startColumn, tasks: startTasks },
            [endColumn.id]: { ...endColumn, tasks: endTasks }
        }));
        
        // ** (PENTING) Panggil API untuk update status di database **
        // Anda perlu membuat endpoint PUT /api/tasks/:taskId di backend
        api.put(`/tasks/${draggableId}`, { status: endColumn.id })
           .then(res => console.log("Status berhasil di-update", res.data))
           .catch(err => console.error("Gagal update status:", err));
    };


    return (
        <div className="card">
            <h2>Manajemen Tugas (Must Have)</h2>
            
            {/* Form Tambah Tugas */}
            <form onSubmit={handleAddTask} className="add-task-form">
                <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Tulis tugas baru..."
                />
                <button type="submit">Tambah</button>
            </form>
            
            {loading && <p>Memuat tugas...</p>}
            
            {/* Papan Kanban (To-Do, In-Progress, Done) */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="task-board">
                    {Object.values(columns).map(column => (
                        <Droppable key={column.id} droppableId={column.id}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="task-column"
                                    style={{
                                        background: snapshot.isDraggingOver ? '#e0e0e0' : '#f4f7f6',
                                    }}
                                >
                                    <h3>{column.title} ({column.tasks.length})</h3>
                                    <div className="task-list">
                                        {column.tasks.map((task, index) => (
                                            <Draggable key={task.id} draggableId={task.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps} // Ini yang membuat cursor jadi 'grab'
                                                        className="task-item"
                                                        style={{
                                                            ...provided.draggableProps.style,
                                                            backgroundColor: snapshot.isDragging ? '#d3eaff' : '#ffffff',
                                                        }}
                                                    >
                                                        <p>{task.title}</p>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                        {column.tasks.length === 0 && !loading && (
                                            <p className="empty-task">Kosong</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
}

export default TasksPage;