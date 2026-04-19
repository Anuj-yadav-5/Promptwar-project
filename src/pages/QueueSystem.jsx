import React, { useState } from 'react';
import { Clock, Users, ArrowRight, CheckCircle2, Ticket } from 'lucide-react';
import { useCrowd } from '../context/CrowdContext';
import Modal from '../components/Modal';

export default function QueueSystem() {
  const { state, dispatch, addToast } = useCrowd();
  const [filter, setFilter] = useState('all');
  const [selectedQueue, setSelectedQueue] = useState(null);

  const categories = [
    { id: 'all', label: 'All Queues' },
    { id: 'food', label: 'Food' },
    { id: 'drinks', label: 'Drinks' },
    { id: 'restroom', label: 'Restrooms' },
    { id: 'merchandise', label: 'Merchandise' },
  ];

  const filteredQueues = state.queues.filter(
    q => filter === 'all' || q.category === filter
  ).sort((a, b) => a.currentWait - b.currentWait);

  const handleJoinQueue = (queue) => {
    dispatch({ type: 'JOIN_QUEUE', payload: queue });
    addToast({
      title: 'Joined Virtual Queue',
      message: `You are now in line for ${queue.name}. Estimated wait: ${queue.currentWait} min.`,
      priority: 'info'
    });
    setSelectedQueue(null);
  };

  const handleLeaveQueue = (queueId) => {
    dispatch({ type: 'LEAVE_QUEUE', payload: queueId });
    addToast({
      title: 'Left Queue',
      message: 'You have left the virtual queue.',
      priority: 'info'
    });
  };

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-3xl font-display font-bold text-white mb-2">Smart Queues</h1>
        <p className="text-slate-400">Join virtual queues and avoid waiting in physical lines.</p>
      </div>

      {/* Active User Queues */}
      {state.userQueues.length > 0 && (
        <div className="mb-8 p-6 glass-panel border-neon-cyan/50 bg-neon-cyan/5">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Ticket className="text-neon-cyan" size={20} />
            Your Active Tickets
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.userQueues.map(uq => (
              <div key={uq.id} className="bg-navy-900/80 p-5 rounded-xl border border-neon-cyan/30 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">{uq.name}</h3>
                    <p className="text-xs text-slate-400 capitalize">{uq.category}</p>
                  </div>
                  <div className="w-12 h-12 bg-neon-cyan/20 rounded-full flex items-center justify-center border-2 border-neon-cyan text-neon-cyan font-bold text-xl drop-shadow-[0_0_10px_rgba(0,212,255,0.8)]">
                    {uq.position}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm">
                    <span className="text-slate-400 block text-xs">Est. Wait</span>
                    <span className="text-white font-bold">{Math.max(1, uq.currentWait - (5 - uq.position))} min</span>
                  </div>
                  <button 
                    onClick={() => handleLeaveQueue(uq.id)}
                    className="text-xs text-slate-400 hover:text-neon-red transition-colors underline"
                  >
                    Leave Queue
                  </button>
                </div>
                
                {/* Progress bar background */}
                <div className="absolute bottom-0 left-0 h-1 bg-navy-800 w-full">
                  <div 
                    className="h-full bg-neon-cyan transition-all duration-1000"
                    style={{ width: `${Math.max(10, 100 - (uq.position * 10))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === c.id 
                ? 'bg-white text-navy-900 shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                : 'glass-panel text-slate-400 hover:text-white'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Queue List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredQueues.map(q => {
          const isJoined = state.userQueues.some(uq => uq.id === q.id);
          const waitColor = q.currentWait < 5 ? 'text-neon-green' : q.currentWait < 10 ? 'text-yellow-400' : 'text-neon-orange';
          
          return (
            <div key={q.id} className="glass-panel-hover p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-white text-lg">{q.name}</h3>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 bg-white/5 px-2 py-1 rounded">{q.category}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 my-4">
                  <div>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mb-1"><Clock size={12}/> Wait Time</p>
                    <p className={`text-2xl font-bold font-display ${waitColor}`}>{q.currentWait} <span className="text-sm font-body font-normal text-slate-500">m</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mb-1"><Users size={12}/> In Line</p>
                    <p className="text-2xl font-bold font-display text-white">{q.queueLength}</p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => !isJoined && setSelectedQueue(q)}
                disabled={isJoined}
                className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-all mt-4 ${
                  isJoined 
                    ? 'bg-navy-800 text-slate-500 cursor-not-allowed border border-white/5' 
                    : 'bg-white/5 text-white hover:bg-neon-cyan/20 hover:text-neon-cyan hover:border-neon-cyan/30 border border-transparent'
                }`}
              >
                {isJoined ? (
                  <><CheckCircle2 size={16} /> Joined</>
                ) : (
                  <><Ticket size={16} /> Join Virtual Queue</>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      <Modal isOpen={!!selectedQueue} onClose={() => setSelectedQueue(null)} title="Confirm Queue Join">
        {selectedQueue && (
          <div className="space-y-6">
            <div className="bg-navy-900 border border-slate-700 p-4 rounded-xl text-center">
              <h4 className="text-xl font-bold text-white">{selectedQueue.name}</h4>
              <p className="text-sm text-slate-400 mt-1 capitalize">{selectedQueue.category}</p>
              
              <div className="flex justify-center items-center gap-8 mt-6">
                <div>
                  <p className="text-sm text-slate-500">Estimated Wait</p>
                  <p className="text-2xl font-bold text-neon-cyan">{selectedQueue.currentWait} min</p>
                </div>
                <ArrowRight className="text-slate-600" />
                <div>
                  <p className="text-sm text-slate-500">People Ahead</p>
                  <p className="text-2xl font-bold text-white">{selectedQueue.queueLength}</p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-slate-400 text-center">
              We'll notify you when it's your turn. You have 5 minutes to arrive once called.
            </p>
            
            <div className="flex gap-3">
              <button 
                className="flex-1 py-3 rounded-xl border border-slate-700 text-white hover:bg-white/5 transition-colors font-medium"
                onClick={() => setSelectedQueue(null)}
              >
                Cancel
              </button>
              <button 
                className="flex-1 py-3 rounded-xl gradient-btn"
                onClick={() => handleJoinQueue(selectedQueue)}
              >
                Confirm Join
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
