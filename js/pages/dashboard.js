// Dashboard Page Logic - Ultra Modern with Attractive Task Cards
import { auth } from '../shared/firebase-config.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getData, subscribe, unsubscribe, setData, updateData } from '../shared/db.js';
import { formatCurrency, formatDate, getUserBadge, showToast, redirectTo, copyToClipboard } from '../shared/utils.js';
import { initAuthGuard } from '../shared/auth-guard.js';

let currentUser = null;
let subscriptions = [];

// Pre-defined finance/growth related images from Unsplash
const FINANCE_IMAGES = [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
    'https://images.unsplash.com/photo-1591696205601-2f950c417cb9',
    'https://images.unsplash.com/photo-1642790105117-7e8086c12c2c',
    'https://images.unsplash.com/photo-1579621970588-ea0f17e44ad9',
    'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f',
    'https://images.unsplash.com/photo-1624996379697-f01d168b1a52',
    'https://images.unsplash.com/photo-1614025203611-9820b64d90b2',
    'https://images.unsplash.com/photo-1604594849920-329337ff7701',
    'https://images.unsplash.com/photo-1631607093863-4c12138a00ff',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f',
    'https://images.unsplash.com/photo-1561414927-6bbc6ed8d9a7',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44',
    'https://images.unsplash.com/photo-1607863680198-233e6d6d6b5a',
    'https://images.unsplash.com/photo-1628348074787-3ef2fd3c186e',
    'https://images.unsplash.com/photo-1634704836-937e500db976',
    'https://images.unsplash.com/photo-1593672715438-d88a70629a5f',
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
    'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f',
    'https://images.unsplash.com/photo-1612550763863-3d0a5ab2d6ee',
    'https://images.unsplash.com/photo-1580519542036-c47de619ea5c',
    'https://images.unsplash.com/photo-1612178537253-b4d2d1e68c6e',
    'https://images.unsplash.com/photo-1605792657660-73dd5671e4da',
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0',
    'https://images.unsplash.com/photo-1621504441378-7e9f5e87c35c',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f',
    'https://images.pexels.com/photos/50987/money-card-business-credit-card-50987.jpeg',
    'https://images.pexels.com/photos/394372/pexels-photo-394372.jpeg',
    'https://images.pexels.com/photos/210574/pexels-photo-210574.jpeg',
    'https://images.pexels.com/photos/6694543/pexels-photo-6694543.jpeg',
    'https://images.pexels.com/photos/730564/pexels-photo-730564.jpeg',
    'https://images.pexels.com/photos/6801872/pexels-photo-6801872.jpeg',
    'https://images.pexels.com/photos/4386367/pexels-photo-4386367.jpeg',
    'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
    'https://images.pexels.com/photos/6771610/pexels-photo-6771610.jpeg',
    'https://images.pexels.com/photos/4968636/pexels-photo-4968636.jpeg',
    'https://images.pexels.com/photos/4968631/pexels-photo-4968631.jpeg',
    'https://images.pexels.com/photos/5092578/pexels-photo-5092578.jpeg',
    'https://images.pexels.com/photos/6801642/pexels-photo-6801642.jpeg',
    'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
    'https://images.pexels.com/photos/259200/pexels-photo-259200.jpeg',
    'https://images.pexels.com/photos/394371/pexels-photo-394371.jpeg',
    'https://images.pexels.com/photos/210990/pexels-photo-210990.jpeg',
    'https://images.pexels.com/photos/259249/pexels-photo-259249.jpeg',
    'https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg',
    'https://images.pexels.com/photos/128867/pexels-photo-128867.jpeg',
    'https://images.pexels.com/photos/259165/pexels-photo-259165.jpeg',
    'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg',
    'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg',
    'https://cdn.pixabay.com/photo/2015/05/26/09/37/paypal-784404_1280.jpg',
    'https://cdn.pixabay.com/photo/2017/09/07/13/49/bitcoin-2724551_1280.jpg',
    'https://cdn.pixabay.com/photo/2016/11/27/21/42/stock-1863880_1280.jpg',
    'https://cdn.pixabay.com/photo/2017/08/10/01/23/bitcoin-2619491_1280.jpg',
    'https://cdn.pixabay.com/photo/2021/06/07/16/02/finance-6317953_1280.jpg',
    'https://cdn.pixabay.com/photo/2017/07/18/18/24/bitcoin-2516498_1280.jpg',
    'https://cdn.pixabay.com/photo/2020/01/23/13/44/wallet-4788183_1280.jpg',
    'https://cdn.pixabay.com/photo/2017/05/12/09/15/gold-2307119_1280.jpg',
    'https://cdn.pixabay.com/photo/2018/02/06/14/06/finance-3134118_1280.jpg',
    'https://cdn.pixabay.com/photo/2016/03/27/19/31/money-1281002_1280.jpg',
    'https://images.unsplash.com/photo-1624996370101-f16b2e1f9a12',
    'https://images.unsplash.com/photo-1609017904472-5c7bff8e04ed',
    'https://images.unsplash.com/photo-1611095564985-89c3a363e0c',
    'https://images.unsplash.com/photo-1611972261058-9d7e9e1b4a4e',
    'https://images.unsplash.com/photo-1601598851547-9f456ae9faf9',
    'https://images.unsplash.com/photo-1621768216001-0b1c09a21f69',
    'https://images.unsplash.com/photo-1621382612239-d408d939d3b5',
    'https://images.unsplash.com/photo-1633158829585-23ba8bd9c3f6',
    'https://images.unsplash.com/photo-1642600192442-2b8bb6c3c1ee',
    'https://images.unsplash.com/photo-1638913974023-1d6127d26b23',
    'https://images.unsplash.com/photo-1607748862156-7c548e4e7d1f',
    'https://images.unsplash.com/photo-1642790551255-8b2790ed7d36',
    'https://images.unsplash.com/photo-1635321593217-40050ad13c74',
    'https://images.unsplash.com/photo-1642543492457-4183e6c7c4dc',
    'https://images.unsplash.com/photo-1631603099989-8d8d76f2f75c',
    'https://images.unsplash.com/photo-1638913660100-6e6d48a1925f',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
    'https://images.unsplash.com/photo-1600965962361-9035d5b3e63f',
    'https://images.unsplash.com/photo-1624996370344-f8f5b3f00a4e',
    'https://images.unsplash.com/photo-1633177317976-3f1c2e4c4c1f',
    'https://images.unsplash.com/photo-1640344975573-03fb6c1c0c4e',
    'https://images.pexels.com/photos/6771608/pexels-photo-6771608.jpeg',
    'https://images.pexels.com/photos/4386158/pexels-photo-4386158.jpeg',
    'https://images.pexels.com/photos/6694519/pexels-photo-6694519.jpeg',
    'https://images.pexels.com/photos/8378752/pexels-photo-8378752.jpeg',
    'https://images.pexels.com/photos/394370/pexels-photo-394370.jpeg',
    'https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg',
    'https://images.pexels.com/photos/3183183/pexels-photo-3183183.jpeg',
    'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg',
    'https://images.pexels.com/photos/259132/pexels-photo-259132.jpeg',
    'https://images.pexels.com/photos/259209/pexels-photo-259209.jpeg',
    'https://images.pexels.com/photos/164531/pexels-photo-164531.jpeg',
    'https://images.pexels.com/photos/327235/pexels-photo-327235.jpeg',
    'https://images.pexels.com/photos/210607/pexels-photo-210607.jpeg',
    'https://images.pexels.com/photos/6694550/pexels-photo-6694550.jpeg',
    'https://images.pexels.com/photos/8378757/pexels-photo-8378757.jpeg',
    'https://images.pexels.com/photos/4968640/pexels-photo-4968640.jpeg',
    'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg',
    'https://images.pexels.com/photos/8378755/pexels-photo-8378755.jpeg',
    'https://images.pexels.com/photos/3184283/pexels-photo-3184283.jpeg',
    'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg',
    'https://images.pexels.com/photos/6694549/pexels-photo-6694549.jpeg',
    'https://images.pexels.com/photos/4968639/pexels-photo-4968639.jpeg',
    'https://images.pexels.com/photos/8378751/pexels-photo-8378751.jpeg',
    'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg',
    'https://images.pexels.com/photos/265076/pexels-photo-265076.jpeg',
    'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg',
    'https://images.pexels.com/photos/164877/pexels-photo-164877.jpeg',
    'https://images.unsplash.com/photo-1614025203611-9820b64d90b2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1631607093863-4c12138a00ff?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1593672715438-d88a70629a5f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1609017904472-5c7bff8e04ed?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1642790105117-7e8086c12c2c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1635321593217-40050ad13c74?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1634704836-937e500db976?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1621382612239-d408d939d3b5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1633158829585-23ba8bd9c3f6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1601598851547-9f456ae9faf9?auto=format&fit=crop&w=800&q=80'
];
// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    currentUser = await initAuthGuard(onUserAuthenticated, onUserUnauthenticated);
});

async function onUserAuthenticated(user) {
    currentUser = user;
    document.body.style.visibility = 'visible';
    
    initThemeToggle();
    initNavigation();
    loadUserData();
    loadTasks();
    setupMenu();
}

function onUserUnauthenticated() {
    redirectTo('index.html');
}

// Initialize theme toggle
async function initThemeToggle() {
    const { initGlobalTheme, toggleTheme } = await import('../shared/utils.js');
    await initGlobalTheme(currentUser.uid);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', async () => {
            await toggleTheme(currentUser.uid);
        });
    }
}

// Initialize navigation
function initNavigation() {
    const walletBtn = document.getElementById('walletBtn');
    const menuBtn = document.getElementById('menuBtn');
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    
    if (walletBtn) {
        walletBtn.addEventListener('click', () => redirectTo('wallet.html'));
    }
    
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            const dropdown = document.getElementById('menuDropdown');
            dropdown.classList.toggle('active');
        });
    }
    
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', () => {
            const dropdown = document.getElementById('menuDropdown');
            dropdown.classList.toggle('active');
        });
    }
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#menuBtn') && !e.target.closest('#hamburgerMenu') && !e.target.closest('#menuDropdown')) {
            const dropdown = document.getElementById('menuDropdown');
            if (dropdown) {
                dropdown.classList.remove('active');
            }
        }
    });
}

// Load user data with real-time updates
async function loadUserData() {
    try {
        const userData = await getData(`USERS/${currentUser.uid}`);
        if (userData) {
            updateUserProfile(userData);
            await updateUserStats(userData);
            checkVerificationStatus(userData);
        }
        
        const userRef = subscribe(`USERS/${currentUser.uid}`, async (userData) => {
            if (!userData) return;
            updateUserProfile(userData);
            await updateUserStats(userData);
            checkVerificationStatus(userData);
        });
        
        subscriptions.push(userRef);
    } catch (error) {
        console.error('Error loading user data:', error);
        showToast('Error loading profile data', 'error');
    }
}

// Update user profile section
function updateUserProfile(userData) {
    if (!userData) return;
    
    const personalInfo = userData.personalInfo || {};
    
    const profileInitial = document.getElementById('profileInitial');
    if (profileInitial) {
        const name = personalInfo.name || personalInfo.email || 'User';
        const initial = name.charAt(0).toUpperCase();
        profileInitial.textContent = initial;
    }
    
    const profileName = document.getElementById('profileName');
    if (profileName) {
        const badge = getUserBadge(userData);
        const displayName = personalInfo.name || personalInfo.email || 'User';
        profileName.innerHTML = `
            ${displayName}
            <span style="display: inline-flex; align-items: center; gap: 4px; background: ${badge.color === 'green' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'}; color: ${badge.color === 'green' ? '#22c55e' : '#ef4444'}; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 700; margin-left: 6px;">
                <i class="fas ${badge.icon}" style="font-size: 9px;"></i>
                ${badge.text}
            </span>
        `;
    }
    
    const joinedDate = document.getElementById('joinedDate');
    if (joinedDate) {
        const date = personalInfo.joinDate || Date.now();
        joinedDate.textContent = formatDate(date);
    }
    
    const referralCode = document.getElementById('referralCode');
    if (referralCode) {
        const refCode = personalInfo.refCode || 'N/A';
        referralCode.textContent = refCode;
        referralCode.style.cursor = refCode !== 'N/A' ? 'pointer' : 'default';
        if (refCode !== 'N/A') {
            referralCode.onclick = () => {
                const referralLink = `${window.location.origin}/index.html?ref=${refCode}`;
                copyToClipboard(referralLink);
            };
        }
    }
}

// Update user statistics
async function updateUserStats(userData) {
    const financialInfo = userData.financialInfo || {};
    const taskHistory = userData.taskHistory || {};
    
    const profileEarnings = document.getElementById('profileEarnings');
    if (profileEarnings) {
        profileEarnings.textContent = formatCurrency(financialInfo.balance || 0);
    }
    
    const totalReferrals = document.getElementById('totalReferrals');
    if (totalReferrals) {
        const referralCount = await getReferralCount(currentUser.uid);
        totalReferrals.textContent = referralCount;
    }
    
    const tasksCompleted = document.getElementById('tasksCompleted');
    if (tasksCompleted) {
        tasksCompleted.textContent = taskHistory.completed || 0;
    }
}

// Check verification status
function checkVerificationStatus(userData) {
    const personalInfo = userData.personalInfo || {};
    const telegramNotice = document.getElementById('telegramNotice');
    
    if (telegramNotice) {
        if (!personalInfo.verified) {
            telegramNotice.style.display = 'block';
            telegramNotice.innerHTML = `
                <i class="fas fa-shield-alt" style="color: var(--accent-color); margin-right: 6px; font-size: 11px;"></i>
                Join our <a href="https://t.me/CashByKing" target="_blank" style="color: var(--accent-color); font-weight: 700; text-decoration: none;">Telegram Channel</a> for verification & updates!
            `;
        } else {
            telegramNotice.style.display = 'none';
        }
    }
}

// Get referral count
async function getReferralCount(userId) {
    const allUsers = await getData('USERS');
    if (!allUsers) return 0;
    
    let count = 0;
    for (const uid in allUsers) {
        if (allUsers[uid].personalInfo?.referrerId === userId) {
            count++;
        }
    }
    return count;
}

// Load and display tasks
async function loadTasks() {
    const allTasks = await getData('TASKS');
    if (!allTasks) {
        showNoTasksMessage();
        return;
    }
    
    const activeTasks = Object.entries(allTasks)
        .filter(([_, task]) => task.status === 'active' || !task.status)
        .map(([id, task]) => ({ id, ...task }));
    
    if (activeTasks.length === 0) {
        showNoTasksMessage();
        return;
    }
    
    // Check task completion status for current user
    await checkUserTaskStatus(activeTasks);
    
    displayTasks(activeTasks);
}

// Check which tasks user has completed
async function checkUserTaskStatus(tasks) {
    try {
        // Get all pending tasks
        const allPendingTasks = await getData('PENDING_TASKS');
        
        // Mark tasks as completed or pending for current user
        for (let task of tasks) {
            // Check if in completedBy array
            const completedBy = task.completedBy || [];
            if (completedBy.includes(currentUser.uid)) {
                task.userStatus = 'completed';
                continue;
            }
            
            // Check if pending review
            if (allPendingTasks) {
                const pending = Object.values(allPendingTasks).find(p => 
                    p.userId === currentUser.uid && 
                    p.taskId === task.id && 
                    p.status === 'pending'
                );
                if (pending) {
                    task.userStatus = 'pending';
                    continue;
                }
            }
            
            task.userStatus = 'available';
        }
    } catch (error) {
        console.error('Error checking task status:', error);
    }
}

// Display tasks in the UI - ULTRA MODERN DESIGN
function displayTasks(tasks) {
    const tasksContainer = document.getElementById('tasksContainer');
    if (!tasksContainer) return;
    
    tasksContainer.innerHTML = '';
    
    tasks.forEach((task, index) => {
        const taskCard = createModernTaskCard(task, index);
        tasksContainer.appendChild(taskCard);
    });
}

// Generate random likes between 50-200
function generateRandomLikes() {
    return Math.floor(Math.random() * 151) + 50; // 50-200 range
}

// Generate random completion count
function generateRandomCompletions() {
    return Math.floor(Math.random() * 151) + 50; // 50-200 range
}

// Get image based on task title
function getTaskImage(task) {
    // If admin provided thumbnail, use it
    if (task.thumbnail || task.image) {
        return task.thumbnail || task.image;
    }
    
    // Otherwise get image based on task title
    const taskTitle = (task.title || task.taskTitle || 'Earn Money Task').toLowerCase();
    
    // Task title ke hisab se relevant image select karo
    let imageIndex = 0;
    
    if (taskTitle.includes('youtube') || taskTitle.includes('video') || taskTitle.includes('watch')) {
        imageIndex = 1; // YouTube/Video related
    } else if (taskTitle.includes('app') || taskTitle.includes('install') || taskTitle.includes('download')) {
        imageIndex = 2; // App install related
    } else if (taskTitle.includes('survey') || taskTitle.includes('question') || taskTitle.includes('poll')) {
        imageIndex = 3; // Survey related
    } else if (taskTitle.includes('social') || taskTitle.includes('facebook') || taskTitle.includes('instagram')) {
        imageIndex = 4; // Social media related
    } else if (taskTitle.includes('crypto') || taskTitle.includes('bitcoin') || taskTitle.includes('blockchain')) {
        imageIndex = 5; // Crypto related
    } else if (taskTitle.includes('growth') || taskTitle.includes('success') || taskTitle.includes('achievement')) {
        imageIndex = 6; // Growth related
    } else if (taskTitle.includes('earn') || taskTitle.includes('money') || taskTitle.includes('cash')) {
        imageIndex = 7; // Money earning related
    } else if (taskTitle.includes('investment') || taskTitle.includes('stock') || taskTitle.includes('trade')) {
        imageIndex = 8; // Investment related
    } else if (taskTitle.includes('market') || taskTitle.includes('business') || taskTitle.includes('finance')) {
        imageIndex = 9; // Business/Finance related
    }
    
    // Task ID ke basis pe consistent image milega
    let hash = 0;
    for (let i = 0; i < task.id.length; i++) {
        hash = task.id.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);
    
    // Final image select karo - task type aur ID dono consider karo
    const finalIndex = (hash + imageIndex) % FINANCE_IMAGES.length;
    return FINANCE_IMAGES[finalIndex];
}

// Create ultra modern task card
function createModernTaskCard(task, index) {
    const card = document.createElement('div');
    card.className = 'modern-task-card';
    
    // Generate attractive random stats
    const randomLikes = generateRandomLikes();
    const randomCompletions = generateRandomCompletions();
    const randomEngagement = Math.floor(Math.random() * 301) + 200; // 200-500
    
    // Task data with fallbacks
    const taskTitle = task.title || task.taskTitle || 'Earn Money Task';
    const taskDescription = task.description || task.desc || 'Complete this task and earn instant rewards!';
    const taskPrice = task.price || task.amount || task.reward || 25;
    
    // FOMO Marketing - Get or generate persistent completion count
    let fomoCount = task.fomoCount || null;
    if (!fomoCount) {
        // Generate random number between 500-2000 for FOMO
        fomoCount = Math.floor(Math.random() * 1501) + 500;
        // Note: Admin will need to save this to database for persistence
    }
    
    // Check user completion status
    const userStatus = task.userStatus || 'available';
    const isCompleted = userStatus === 'completed';
    const isPending = userStatus === 'pending';
    
    // Get task image based on title
    const taskImage = getTaskImage(task);
    
    // Category based on index for variety
    const categories = ['Social Media', 'YouTube', 'App Install', 'Survey', 'Website Visit'];
    const taskCategory = categories[index % categories.length];
    
    // Difficulty badge color
    const difficulties = ['#10b981', '#f59e0b', '#ef4444'];
    const difficultyColor = difficulties[index % difficulties.length];
    const difficultyText = ['Easy', 'Medium', 'Hard'][index % 3];
    
    card.style.cssText = `
        background: linear-gradient(135deg, var(--nav-bg) 0%, rgba(99,102,241,0.05) 100%);
        backdrop-filter: blur(20px);
        border-radius: 20px;
        padding: 0;
        margin-bottom: 16px;
        border: 1px solid var(--border-color);
        overflow: hidden;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        position: relative;
    `;

    card.innerHTML = `
        <!-- Premium Glow Border -->
        <div style="position: absolute; inset: 0; border-radius: 20px; padding: 1px; background: linear-gradient(135deg, var(--accent-color), #8b5cf6, #06b6d4); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; opacity: ${isCompleted ? '0.2' : '0.4'}; pointer-events: none;"></div>
        
        <!-- Completion Status Overlay -->
        ${isCompleted ? `
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10; background: rgba(34, 197, 94, 0.95); backdrop-filter: blur(10px); padding: 12px 24px; border-radius: 50px; border: 2px solid white; box-shadow: 0 8px 32px rgba(34, 197, 94, 0.4);">
                <div style="display: flex; align-items: center; gap: 8px; color: white; font-weight: 900; font-size: 14px; letter-spacing: 0.5px;">
                    <i class="fas fa-check-circle" style="font-size: 18px;"></i>
                    <span>ALREADY COMPLETED</span>
                </div>
            </div>
        ` : ''}
        
        <!-- Header Section -->
        <div style="position: relative; padding: 14px 16px 12px; background: linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 100%); border-bottom: 1px solid rgba(99,102,241,0.1); ${isCompleted ? 'opacity: 0.6;' : ''}">
            <!-- Badges Row -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="background: ${difficultyColor}; color: white; padding: 4px 10px; border-radius: 12px; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; box-shadow: 0 2px 8px ${difficultyColor}40;">
                    ${difficultyText}
                </div>
                <div style="background: ${isPending ? '#f59e0b' : 'rgba(0,0,0,0.8)'}; color: white; padding: 4px 10px; border-radius: 12px; font-size: 9px; font-weight: 700; backdrop-filter: blur(10px);">
                    ${isPending ? 'UNDER REVIEW ⏳' : 'LIVE 🎉🥳'}
                </div>
            </div>
            
            <!-- Title & Reward -->
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="font-size: 15px; font-weight: 800; color: var(--text-color); margin: 0; line-height: 1.2; flex: 1; padding-right: 12px;">${taskTitle}</h3>
                <div style="text-align: right;">
                    <div style="font-size: 18px; font-weight: 900; color: var(--accent-color); line-height: 1; margin-bottom: 2px;">${formatCurrency(taskPrice)}</div>
                    <div style="font-size: 9px; color: var(--text-color); opacity: 0.7; font-weight: 600;">REWARD</div>
                </div>
            </div>
        </div>

        <!-- Thumbnail Section -->
        <div style="width: 100%; height: 120px; background: url('${taskImage}') center/cover; position: relative; overflow: hidden;">
            <div style="position: absolute; inset: 0; background: linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.15) 100%);"></div>
            
            <!-- Large Icon with Low Opacity -->
            ${!task.thumbnail && !task.image ? `
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.3;">
                    <i class="fas ${getTaskIcon(taskCategory)}" style="font-size: 48px; color: white;"></i>
                </div>
            ` : ''}
            
            <!-- FOMO Stats Overlay -->
            <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 10px 16px; background: linear-gradient(transparent, rgba(0,0,0,0.9));">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <div style="width: 5px; height: 5px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite;"></div>
                        <div style="font-size: 11px; color: rgba(255,255,255,0.95); font-weight: 700;">${fomoCount} users payment done ✅</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Content Section -->
        <div style="padding: 14px 16px; ${isCompleted ? 'opacity: 0.6;' : ''}">
            <!-- Description -->
            <p style="font-size: 12px; color: var(--text-color); opacity: 0.8; line-height: 1.4; margin: 0 0 14px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                ${taskDescription}
            </p>

            <!-- Engagement Stats -->
            <div style="display: none; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px;">
                <div style="text-align: center; padding: 8px; background: rgba(99,102,241,0.06); border-radius: 10px; border: 1px solid rgba(99,102,241,0.1);">
                    <div style="font-size: 14px; font-weight: 900; color: var(--accent-color); line-height: 1; margin-bottom: 3px;">${randomLikes}</div>
                    <div style="font-size: 9px; color: var(--text-color); opacity: 0.7; font-weight: 600;">LIKES</div>
                </div>
                <div style="text-align: center; display: none; padding: 8px; background: rgba(245,158,11,0.06); border-radius: 10px; border: 1px solid rgba(245,158,11,0.1);">
                    <div style="font-size: 14px; font-weight: 900; color: #f59e0b; line-height: 1; margin-bottom: 3px;">${randomEngagement}</div>
                    <div style="font-size: 9px; color: var(--text-color); opacity: 0.7; font-weight: 600;">ACTIVE</div>
                </div>
                <div style="text-align: center; padding: 8px; background: rgba(16,185,129,0.06); border-radius: 10px; border: 1px solid rgba(16,185,129,0.1);">
                    <div style="font-size: 14px; font-weight: 900; color: #10b981; line-height: 1; margin-bottom: 3px;">${Math.floor(Math.random() * 200) + 100}</div>
                    <div style="font-size: 9px; color: var(--text-color); opacity: 0.7; font-weight: 600;">VIEWS</div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div style="display: flex; gap: 10px;">
                <!-- Like Button -->
                <button 
                    class="modern-like-btn" 
                    data-task-id="${task.id}"
                    ${isCompleted || isPending ? 'disabled' : ''}
                    style="flex: 1; 
                           background: rgba(99,102,241,0.08); 
                           border: 1.5px solid rgba(99,102,241,0.2);
                           padding: 10px 12px; 
                           border-radius: 10px; 
                           font-size: 11px; 
                           font-weight: 800; 
                           color: var(--accent-color); 
                           cursor: ${isCompleted || isPending ? 'not-allowed' : 'pointer'}; 
                           transition: all 0.2s ease;
                           display: flex;
                           align-items: center;
                           justify-content: center;
                           gap: 5px;
                           opacity: ${isCompleted || isPending ? '0.5' : '1'};">
                    <i class="fas fa-heart" style="font-size: 11px;"></i>
                    <span>LIKE</span>
                </button>
                
                <!-- Start Button -->
                <button 
                    class="modern-start-btn" 
                    data-task-id="${task.id}"
                    ${isCompleted || isPending ? 'disabled' : ''}
                    style="flex: 2; 
                           background: ${isCompleted ? 'linear-gradient(135deg, #22c55e, #16a34a)' : isPending ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, var(--accent-color), #8b5cf6)'}; 
                           border: none; 
                           padding: 11px 16px; 
                           border-radius: 10px; 
                           font-size: 12px; 
                           font-weight: 800; 
                           color: white; 
                           cursor: ${isCompleted || isPending ? 'not-allowed' : 'pointer'}; 
                           transition: all 0.3s ease;
                           box-shadow: 0 4px 15px rgba(99,102,241,0.3);
                           display: flex;
                           align-items: center;
                           justify-content: center;
                           gap: 6px;
                           letter-spacing: 0.3px;
                           opacity: ${isCompleted || isPending ? '0.7' : '1'};">
                    <i class="fas ${isCompleted ? 'fa-check-circle' : isPending ? 'fa-clock' : 'fa-play'}" style="font-size: 10px;"></i>
                    <span>${isCompleted ? 'COMPLETED' : isPending ? 'PENDING' : 'START NOW'}</span>
                </button>
            </div>
        </div>

        <!-- Bottom Gradient Accent -->
        <div style="height: 2px; background: linear-gradient(90deg, var(--accent-color), #8b5cf6, var(--accent-color)); border-radius: 0 0 20px 20px; opacity: 0.6;"></div>
    `;
    
    // Add premium hover effects
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-6px) scale(1.02)';
        card.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(99,102,241,0.1)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
        card.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
    });
    
    // Add click event to entire card
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.modern-like-btn') && !e.target.closest('.modern-start-btn')) {
            redirectTo(`task-detail.html?id=${task.id}`);
        }
    });
    
    // Add like button functionality
    const likeBtn = card.querySelector('.modern-like-btn');
    likeBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await handleTaskLike(task.id, likeBtn, randomLikes);
    });
    
    // Add start button functionality
    const startBtn = card.querySelector('.modern-start-btn');
    startBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        redirectTo(`task-detail.html?id=${task.id}`);
    });
    
    // Enhanced button hover effects
    likeBtn.addEventListener('mouseenter', () => {
        likeBtn.style.background = 'rgba(99,102,241,0.2)';
        likeBtn.style.borderColor = 'rgba(99,102,241,0.4)';
        likeBtn.style.transform = 'scale(1.05)';
    });
    
    likeBtn.addEventListener('mouseleave', () => {
        likeBtn.style.background = 'rgba(99,102,241,0.1)';
        likeBtn.style.borderColor = 'rgba(99,102,241,0.2)';
        likeBtn.style.transform = 'scale(1)';
    });
    
    startBtn.addEventListener('mouseenter', () => {
        startBtn.style.transform = 'scale(1.05)';
        startBtn.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.6)';
    });
    
    startBtn.addEventListener('mouseleave', () => {
        startBtn.style.transform = 'scale(1)';
        startBtn.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
    });
    
    return card;
}

// Get appropriate icon for task category
function getTaskIcon(category) {
    const iconMap = {
        'Social Media': 'share-alt',
        'YouTube': 'youtube',
        'App Install': 'mobile-alt',
        'Survey': 'clipboard-list',
        'Website Visit': 'globe'
    };
    return iconMap[category] || 'tasks';
}

// Handle task like/unlike with 1 like per user restriction
async function handleTaskLike(taskId, likeBtn, currentLikes) {
    try {
        const taskData = await getData(`TASKS/${taskId}`);
        const userLiked = taskData?.likesData?.[currentUser.uid] === true;
        
        if (userLiked) {
            // User already liked - remove like
            const updatedLikes = Math.max(50, currentLikes - 1); // Ensure minimum 50 likes
            await setData(`TASKS/${taskId}/likes`, updatedLikes);
            await setData(`TASKS/${taskId}/likesData/${currentUser.uid}`, false);
            
            // Update UI
            likeBtn.innerHTML = '<i class="fas fa-heart" style="font-size: 11px;"></i><span>LIKE</span>';
            likeBtn.style.color = 'var(--accent-color)';
            likeBtn.style.background = 'rgba(99,102,241,0.1)';
            
            showToast('Like removed', 'info');
        } else {
            // User hasn't liked yet - add like
            const updatedLikes = Math.min(200, currentLikes + 1); // Ensure maximum 200 likes
            await setData(`TASKS/${taskId}/likes`, updatedLikes);
            await setData(`TASKS/${taskId}/likesData/${currentUser.uid}`, true);
            
            // Update UI
            likeBtn.innerHTML = '<i class="fas fa-heart" style="font-size: 11px; color: #ef4444;"></i><span style="color: #ef4444;">LIKED</span>';
            likeBtn.style.color = '#ef4444';
            likeBtn.style.background = 'rgba(239,68,68,0.1)';
            likeBtn.style.borderColor = 'rgba(239,68,68,0.3)';
            
            showToast('Task liked! ❤️', 'success');
        }
        
    } catch (error) {
        console.error('Like error:', error);
        showToast('Error updating like', 'error');
    }
}

// Show no tasks message
function showNoTasksMessage() {
    const tasksContainer = document.getElementById('tasksContainer');
    if (!tasksContainer) return;
    
    tasksContainer.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: var(--text-color);">
            <div style="width: 80px; height: 80px; background: var(--accent-gradient); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: white; font-size: 32px;">
                <i class="fas fa-tasks"></i>
            </div>
            <p style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">No Active Tasks</p>
            <p style="font-size: 14px; opacity: 0.7; max-width: 300px; margin: 0 auto;">New earning opportunities coming soon! Stay tuned.</p>
        </div>
    `;
}

// Setup menu interactions
function setupMenu() {
    const logoutBtn = document.querySelector('a[href="/logout"]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await signOut(auth);
                showToast('Logged out successfully', 'success');
                redirectTo('index.html');
            } catch (error) {
                showToast('Error logging out', 'error');
            }
        });
    }
}

// Notification permission functions
window.requestNotificationPermission = async function() {
    if (!('Notification' in window)) {
        showToast('Your browser does not support notifications', 'error');
        return;
    }

    try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            showToast('Notifications enabled successfully!', 'success');
            updateNotificationUI('granted');
            
            await updateData(`USERS/${currentUser.uid}/notifications`, {
                enabled: true,
                permission: 'granted',
                enabledAt: Date.now()
            });
            
            new Notification('CashByKing', {
                body: 'You will now receive instant task notifications!',
                icon: '/favicon.ico'
            });
        } else {
            showToast('Notification permission denied', 'warning');
            updateNotificationUI('denied');
        }
    } catch (error) {
        console.error('Notification permission error:', error);
        showToast('Error enabling notifications', 'error');
    }
};

function updateNotificationUI(status) {
    const notificationCard = document.getElementById('notificationCard');
    const notificationTitle = document.getElementById('notificationTitle');
    const notificationSubtitle = document.getElementById('notificationSubtitle');
    const notificationIcon = document.getElementById('notificationIcon');
    const notificationArrow = document.getElementById('notificationArrow');
    
    if (!notificationCard) return;
    
    if (status === 'granted') {
        notificationTitle.textContent = 'Notifications Enabled';
        notificationSubtitle.innerHTML = '<span><i class="fas fa-check-circle" style="font-size: 10px;"></i> Active</span> <span style="opacity: 0.7;">•</span> <span>Receiving Updates</span>';
        notificationIcon.className = 'fas fa-check-circle';
        notificationArrow.innerHTML = '<i class="fas fa-check"></i>';
        notificationCard.style.pointerEvents = 'none';
        notificationCard.style.opacity = '0.7';
    }
}

if ('Notification' in window && Notification.permission === 'granted') {
    updateNotificationUI('granted');
}

// PWA Install functionality
let deferredPrompt;
const pwaInstallBanner = document.getElementById('pwaInstallBanner');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (pwaInstallBanner) {
        pwaInstallBanner.style.display = 'block';
    }
});

window.installPWA = async function() {
    if (!deferredPrompt) {
        showToast('PWA already installed or not available', 'info');
        return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        showToast('App installed successfully!', 'success');
        if (pwaInstallBanner) {
            pwaInstallBanner.style.display = 'none';
        }
        
        await updateData(`USERS/${currentUser.uid}/pwa`, {
            installed: true,
            installedAt: Date.now()
        });
    }
    
    deferredPrompt = null;
};

window.addEventListener('appinstalled', () => {
    if (pwaInstallBanner) {
        pwaInstallBanner.style.display = 'none';
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    subscriptions.forEach(ref => unsubscribe(ref));
});
