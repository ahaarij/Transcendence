import { getFriends, sendFriendRequest, respondToFriendRequest } from "../api/user";
import { getGameHistory } from "../api/game";
import { showToast } from "../utils/ui";

export async function Friends() {
    const container = document.createElement('div');
    container.className = 'p-8 max-w-4xl mx-auto text-white';

    const title = document.createElement('h1');
    title.className = 'text-4xl font-bold mb-8 text-center text-neon-blue';
    title.textContent = 'Friends';
    container.appendChild(title);

    const addFriendSection = document.createElement('div');
    addFriendSection.className = 'mb-8 glass-card p-6 rounded-lg border border-neon-pink shadow-[0_0_15px_rgba(255,0,255,0.3)]';
    addFriendSection.innerHTML = `
        <h2 class="text-2xl font-bold mb-4 text-neon-pink">Add Friend</h2>
        <div class="flex gap-4">
            <input type="text" id="friend-username" placeholder="Enter username" class="flex-1 bg-black/30 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-neon-blue transition-all">
            <button id="add-friend-btn" class="bg-neon-blue hover:bg-blue-600 text-white font-bold py-2 px-6 rounded transition-all shadow-[0_0_10px_rgba(0,255,255,0.5)]">
                Add
            </button>
        </div>
    `;
    container.appendChild(addFriendSection);

    const listsContainer = document.createElement('div');
    listsContainer.className = 'grid grid-cols-1 md:grid-cols-2 gap-8';
    container.appendChild(listsContainer);

    const friendsListContainer = document.createElement('div');
    friendsListContainer.className = 'glass-card p-6 rounded-lg border border-neon-blue shadow-[0_0_15px_rgba(0,255,255,0.3)]';
    friendsListContainer.innerHTML = '<h2 class="text-2xl font-bold mb-4 text-neon-blue">My Friends</h2>';
    const friendsList = document.createElement('div');
    friendsList.className = 'space-y-4';
    friendsListContainer.appendChild(friendsList);
    listsContainer.appendChild(friendsListContainer);

    const requestsListContainer = document.createElement('div');
    requestsListContainer.className = 'glass-card p-6 rounded-lg border border-neon-purple shadow-[0_0_15px_rgba(147,51,234,0.3)]';
    requestsListContainer.innerHTML = '<h2 class="text-2xl font-bold mb-4 text-neon-purple">Pending Requests</h2>';
    const requestsList = document.createElement('div');
    requestsList.className = 'space-y-4';
    requestsListContainer.appendChild(requestsList);
    listsContainer.appendChild(requestsListContainer);

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/90 backdrop-blur-sm hidden z-50 items-center justify-center p-4';
    modal.innerHTML = `
        <div class="glass-card rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden border border-neon-blue shadow-[0_0_50px_rgba(0,255,255,0.15)] flex flex-col">
            <div class="p-4 border-b border-white/10 flex justify-between items-center bg-black/30">
                <h3 class="text-xl font-bold text-neon-blue">Player Profile</h3>
                <button id="close-modal" class="text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <div id="friend-profile-content" class="p-6 overflow-y-auto custom-scrollbar"></div>
        </div>
    `;
    document.body.appendChild(modal);

    const input = addFriendSection.querySelector('#friend-username') as HTMLInputElement;
    const addBtn = addFriendSection.querySelector('#add-friend-btn') as HTMLButtonElement;
    const closeModalBtn = modal.querySelector('#close-modal') as HTMLButtonElement;

    const closeModal = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    };

    closeModalBtn.onclick = closeModal;
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };

    addBtn.onclick = async () => {
        const username = input.value.trim();
        if (!username) return;
        try {
            const res = await sendFriendRequest(username);
            if (res.error) throw new Error(res.error);
            showToast('Friend request sent!', 'success');
            input.value = '';
            loadData();
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    };

    async function loadData() {
        try {
            const data = await getFriends();
            if (data.error) throw new Error(data.error);
            renderFriends(data.friends);
            renderRequests(data.pendingRequests);
        } catch (err: any) {
            console.error(err);
            showToast('Failed to load friends', 'error');
        }
    }

    function renderFriends(friends: any[]) {
        friendsList.innerHTML = '';
        if (friends.length === 0) {
            friendsList.innerHTML = '<p class="text-gray-400">No friends yet.</p>';
            return;
        }

        friends.forEach(friend => {
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between bg-black/30 p-3 rounded hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10';
            item.innerHTML = `
                <div class="flex items-center gap-3">
                    <img src="${friend.avatar || '/assets/default-avatar.png'}" class="w-10 h-10 rounded-full object-cover border border-neon-blue">
                    <span class="font-bold text-white">${friend.username}</span>
                </div>
                <span class="text-xs text-neon-blue">View History</span>
            `;
            item.onclick = () => showFriendHistory(friend);
            friendsList.appendChild(item);
        });
    }

    function renderRequests(requests: any[]) {
        requestsList.innerHTML = '';
        if (requests.length === 0) {
            requestsList.innerHTML = '<p class="text-gray-400">No pending requests.</p>';
            return;
        }

        requests.forEach(req => {
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between bg-black/30 p-3 rounded border border-transparent hover:border-white/10';
            item.innerHTML = `
                <div class="flex items-center gap-3">
                    <img src="${req.from.avatar || '/assets/default-avatar.png'}" class="w-10 h-10 rounded-full object-cover">
                    <span class="text-white">${req.from.username}</span>
                </div>
                <div class="flex gap-2">
                    <button class="accept-btn bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm">Accept</button>
                    <button class="reject-btn bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">Reject</button>
                </div>
            `;
            
            const acceptBtn = item.querySelector('.accept-btn') as HTMLButtonElement;
            const rejectBtn = item.querySelector('.reject-btn') as HTMLButtonElement;

            acceptBtn.onclick = () => handleResponse(req.requestId, true);
            rejectBtn.onclick = () => handleResponse(req.requestId, false);

            requestsList.appendChild(item);
        });
    }

    async function handleResponse(requestId: number, accept: boolean) {
        try {
            const res = await respondToFriendRequest(requestId, accept);
            if (res.error) throw new Error(res.error);
            showToast(accept ? 'Request accepted' : 'Request rejected', 'success');
            loadData();
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    }

    async function showFriendHistory(friend: any) {
        const content = modal.querySelector('#friend-profile-content') as HTMLElement;
        content.innerHTML = `
            <div class="flex flex-col items-center justify-center h-64 space-y-4">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue"></div>
                <p class="text-gray-400">Loading profile...</p>
            </div>
        `;
        modal.classList.remove('hidden');
        modal.classList.add('flex');

        try {
            const history = await getGameHistory(friend.id);
            
            content.innerHTML = `
                <div class="flex flex-col items-center mb-8">
                    <div class="relative">
                        <img src="${friend.avatar || '/assets/default-avatar.png'}" class="w-32 h-32 rounded-full object-cover border-4 border-white/10 shadow-lg ring-2 ring-neon-blue">
                        <div class="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-black" title="Online"></div>
                    </div>
                    <h2 class="text-3xl font-bold text-white mt-4 mb-1">${friend.username}</h2>
                    <p class="text-gray-400 text-sm">Member since ${new Date().getFullYear()}</p>
                </div>

                <div class="grid grid-cols-3 gap-4 mb-8">
                    <div class="bg-black/30 p-4 rounded-xl text-center border border-white/10 hover:border-green-500/50 transition-colors">
                        <div class="text-3xl font-bold text-green-500 mb-1">${history.stats.wins}</div>
                        <div class="text-xs text-gray-400 uppercase tracking-wider">Wins</div>
                    </div>
                    <div class="bg-black/30 p-4 rounded-xl text-center border border-white/10 hover:border-red-500/50 transition-colors">
                        <div class="text-3xl font-bold text-red-500 mb-1">${history.stats.losses}</div>
                        <div class="text-xs text-gray-400 uppercase tracking-wider">Losses</div>
                    </div>
                    <div class="bg-black/30 p-4 rounded-xl text-center border border-white/10 hover:border-neon-blue/50 transition-colors">
                        <div class="text-3xl font-bold text-neon-blue mb-1">${history.stats.winRate}%</div>
                        <div class="text-xs text-gray-400 uppercase tracking-wider">Win Rate</div>
                    </div>
                </div>

                <h3 class="text-lg font-bold mb-4 flex items-center gap-2 text-gray-300">
                    <svg class="w-5 h-5 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Recent Matches
                </h3>
                
                <div class="space-y-3">
                    ${history.matches.length ? history.matches.map((match: any) => `
                        <div class="group flex justify-between items-center bg-black/30 hover:bg-white/5 p-4 rounded-xl border border-white/10 transition-all hover:shadow-lg ${match.won ? 'hover:border-green-500/30' : 'hover:border-red-500/30'}">
                            <div class="flex items-center gap-4">
                                <div class="w-2 h-12 rounded-full ${match.won ? 'bg-green-500' : 'bg-red-500'}"></div>
                                <div>
                                    <div class="font-bold text-white group-hover:text-neon-blue transition-colors">${match.gameMode}</div>
                                    <span class="text-xs text-gray-500">${new Date(match.playedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-2xl font-mono font-bold tracking-wider">
                                    <span class="${match.won ? 'text-green-400' : 'text-gray-500'}">${match.userScore}</span>
                                    <span class="text-gray-600 mx-1">:</span>
                                    <span class="${!match.won ? 'text-red-400' : 'text-gray-500'}">${match.opponentScore}</span>
                                </div>
                                <div class="text-xs text-gray-400 mt-1">vs <span class="text-white">${match.opponent}</span></div>
                            </div>
                        </div>
                    `).join('') : `
                        <div class="text-center py-8 text-gray-500 bg-black/20 rounded-xl border border-white/10 border-dashed">
                            <p>No matches played yet</p>
                        </div>
                    `}
                </div>
            `;
        } catch (err) {
            content.innerHTML = `
                <div class="flex flex-col items-center justify-center h-64 text-red-400">
                    <svg class="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    <p>Failed to load profile</p>
                    <button onclick="this.closest('.fixed').classList.add('hidden');this.closest('.fixed').classList.remove('flex')" class="mt-4 text-sm text-gray-500 hover:text-white underline">Close</button>
                </div>
            `;
        }
    }

    loadData();
    return container;
}
