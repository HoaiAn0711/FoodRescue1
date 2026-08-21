const API_URL = 'http://localhost:5000/api';
let realFoods = [];
let currentAdminView = 'POSTS'; 

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `custom-toast`;
    
    let icon = 'bi-check-circle-fill text-success';
    if(type === 'warning') { icon = 'bi-exclamation-triangle-fill text-warning'; toast.style.borderLeftColor = '#f59e0b'; }
    if(type === 'danger') { icon = 'bi-x-circle-fill text-danger'; toast.style.borderLeftColor = '#ef4444'; }
    
    toast.innerHTML = `<i class="bi ${icon} fs-5"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    const savedName = localStorage.getItem('savedUsername');
    if(!savedName && window.location.pathname.indexOf('login.html') === -1) {
        window.location.href = 'login.html';
        return;
    }
    
    const savedRole = localStorage.getItem('savedRole');
    const userNameEl = document.getElementById('headerUsername');
    const roleEl = document.getElementById('headerRole');
    if(userNameEl) userNameEl.textContent = savedName;
    
    if(roleEl) {
        roleEl.textContent = savedRole;
        const leftPanel = document.getElementById('leftPanelContainer');
        
        if (savedRole === 'ADMIN') {
            roleEl.style.backgroundColor = '#ef4444'; 
            if (leftPanel) {
                leftPanel.innerHTML = `
                    <div class="main-card">
                        <h2 class="title mb-4" style="font-size: 1.2rem;"><i class="bi bi-shield-lock-fill text-danger"></i> Bảng Điều Khiển</h2>
                        <div class="mb-4 p-3 rounded" style="background: #f8fafc; border: 1px solid #e2e8f0;">
                            <h6 class="mb-3 text-secondary fw-bold">Thống kê hệ thống</h6>
                            <div class="d-flex justify-content-between mb-2 small"><span>Tài khoản:</span> <strong id="statUsers">0</strong></div>
                            <div class="d-flex justify-content-between mb-2 small"><span>Bài đăng hiện tại:</span> <strong id="statPosts">0</strong></div>
                            <div class="d-flex justify-content-between small"><span>Đã giải cứu:</span> <strong class="text-success" id="statRescues">0</strong></div>
                        </div>
                        <div class="d-flex flex-column gap-2">
                            <button class="btn-submit" style="background: #3b82f6; border-color: #3b82f6;" onclick="switchAdminView('POSTS')">Kiểm duyệt bài đăng</button>
                            <button class="btn-outline-custom text-primary" onclick="switchAdminView('USERS')">Quản lý người dùng</button>
                        </div>
                    </div>
                `;
            }
        }
        else if (savedRole === 'NGƯỜI NHẬN') {
            roleEl.style.backgroundColor = '#f59e0b'; 
            if (leftPanel) {
                leftPanel.innerHTML = `
                    <div class="main-card text-center">
                        <h1 style="font-size: 3rem; color: #10b981; margin-bottom: 15px;"><i class="bi bi-cart-check"></i></h1>
                        <h5 class="title mb-2" style="font-size: 1.2rem;">Khu Vực Người Nhận</h5>
                        <p class="small mb-0" style="color: #64748b; line-height: 1.6;">Hãy chọn món đồ bạn cần bên cạnh. Hệ thống sẽ giữ chỗ 15 phút để bạn đến lấy.</p>
                    </div>
                `;
            }
        } 
        else {
            roleEl.style.backgroundColor = '#10b981';
            if (leftPanel) {
                leftPanel.innerHTML = `
                    <div class="main-card">
                        <h2 class="title mb-4" style="font-size: 1.2rem;">Đăng Bài Mới</h2>
                        <form id="foodForm">
                            <div class="input-group">
                                <label>Tên thực phẩm</label>
                                <input type="text" id="tenThucPham" placeholder="Ví dụ: 2 hộp cơm..." required>
                            </div>
                            <div class="input-group">
                                <label>Mô tả chi tiết</label>
                                <textarea id="moTa" rows="2" placeholder="Ví dụ: Chay mặn đều dùng được..." required></textarea>
                            </div>
                            <div class="d-flex gap-3 mb-3">
                                <div class="w-50">
                                    <label style="display:block; font-size: 0.85rem; color: #475569; margin-bottom: 8px; font-weight: 600;">Số lượng</label>
                                    <input type="text" id="soLuong" placeholder="VD: 2" required style="width: 100%; padding: 12px 16px; background: var(--input-bg); border: 2px solid transparent; border-radius: 12px; font-size: 0.95rem; color: var(--text-dark);">
                                </div>
                                <div class="w-50">
                                    <label style="display:block; font-size: 0.85rem; color: #475569; margin-bottom: 8px; font-weight: 600;">Hạn dùng</label>
                                    <input type="datetime-local" id="hanDung" required style="width: 100%; padding: 12px 16px; background: var(--input-bg); border: 2px solid transparent; border-radius: 12px; font-size: 0.95rem; color: var(--text-dark);">
                                </div>
                            </div>
                            <div class="input-group">
                                <label>Địa chỉ nhận</label>
                                <input type="text" id="diaChi" placeholder="Nhập địa chỉ chi tiết" required>
                            </div>
                            <div class="input-group">
                                <label>Tải ảnh (Tùy chọn)</label>
                                <input type="file" id="hinhAnh" accept="image/*" style="padding: 10px; background: white; border: 1px dashed #10b981;">
                            </div>
                            <button type="submit" class="btn-submit mt-2">Đăng Lên</button>
                        </form>
                    </div>
                `;
            }
            document.getElementById('foodForm').addEventListener('submit', handleFormSubmit);
        }
    }
    startRealTimeEngine();
});

let realTimeInterval;
function startRealTimeEngine() {
    if(realTimeInterval) clearInterval(realTimeInterval);
    loadAllFoodsData(); 
    updateAdminStats();
    
    realTimeInterval = setInterval(() => {
        loadAllFoodsData(true); 
        updateAdminStats();
    }, 2000); 
}

async function loadAllFoodsData(isBackground = false) { 
    if(localStorage.getItem('savedRole') === 'ADMIN' && currentAdminView === 'USERS') return;
    
    try {
        const res = await fetch(`${API_URL}/food`);
        if(!res.ok) return;
        const foods = await res.json();
        
        const now = Date.now();
        let needRefresh = false;
        
        for (let food of foods) {
            if (food.status === 'reserved' && food.reservedAt) {
                const expiresAt = new Date(food.reservedAt).getTime() + (15 * 60 * 1000);
                if (now >= expiresAt) {
                    await fetch(`${API_URL}/food/${food._id}`, {
                        method: 'PUT',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ status: 'available', reservedBy: null, reservedAt: null })
                    });
                    needRefresh = true;
                }
            }
            if (food.expiryDate && food.status === 'available') {
                const expiryTimestamp = new Date(food.expiryDate).getTime();
                if (now >= expiryTimestamp) {
                    await fetch(`${API_URL}/food/${food._id}`, { method: 'DELETE' });
                    needRefresh = true;
                }
            }
        }
        
        if (needRefresh) {
            const res2 = await fetch(`${API_URL}/food`);
            realFoods = await res2.json();
        } else {
            realFoods = foods;
        }
        
        renderFoodCards(realFoods); 
    } catch (error) {
        if(!isBackground) console.error("Lỗi lấy dữ liệu món ăn:", error);
    }
}

function renderFoodCards(foods) {
    const container = document.getElementById('foodContainer');
    if (!container) return;
    
    const savedName = localStorage.getItem('savedUsername');
    const savedRole = localStorage.getItem('savedRole');
    let html = '';
    
    if(foods.length === 0) {
        container.innerHTML = `<div class="w-100 text-center mt-5 text-muted">Không có bài đăng nào.</div>`;
        return;
    }
    
    foods.forEach(food => {
        const isPublic = (food.status === 'available');
        const isMyPost = (food.donor === savedName);
        const isClaimedByMe = (food.reservedBy === savedName);
        const isAdmin = (savedRole === 'ADMIN');
        
        if (!isAdmin && !isPublic && !isClaimedByMe && !isMyPost) return; 
        
        let badgeHtml = `<span class="pill-status">Sẵn sàng</span>`;
        let actionButtonHtml = '';
        
        const expiryDateObj = new Date(food.expiryDate);
        const expiryStr = isNaN(expiryDateObj.getTime()) ? food.expiryDate : expiryDateObj.toLocaleString('vi-VN');
        let timerDisplay = `HSD: ${expiryStr}`;
        
        if (!isPublic) {
            if (food.status === 'pending_confirmation') {
                timerDisplay = `<span class="text-primary fw-bold">Chờ người tặng duyệt</span>`;
                badgeHtml = `<span class="pill-status" style="background: #e0e7ff; color: #4338ca;">Đang chờ duyệt</span>`;
                if (isAdmin) {
                    actionButtonHtml = `<button class="btn-outline-custom text-danger" onclick="adminForceDelete('${food._id}')">Cưỡng chế xóa</button>`;
                } else if (isClaimedByMe) {
                    actionButtonHtml = `<div class="text-center small text-secondary"><strong>Đã báo nhận.</strong><br>Hệ thống chờ người tặng xác nhận.</div>`;
                } else if (isMyPost) {
                    actionButtonHtml = `
                        <div class="text-center small text-secondary mb-2"><strong>${food.reservedBy}</strong> báo là đã lấy đồ.</div>
                        <div class="d-flex gap-2">
                            <button class="btn-outline-custom text-secondary" style="border-color: #ef4444; color: #ef4444 !important;" onclick="cancelPending('${food._id}')">Chưa lấy</button>
                            <button class="btn-submit" style="padding: 10px; margin-top: 0;" onclick="confirmGiven('${food._id}')">Xác nhận đã cho</button>
                        </div>
                    `;
                }
            } 
            else if (food.status === 'reserved') {
                const expiresAt = new Date(food.reservedAt).getTime() + (15 * 60 * 1000);
                const timeLeft = expiresAt - Date.now();
                const minutes = Math.floor(Math.max(0, timeLeft) / 60000);
                const seconds = Math.floor((Math.max(0, timeLeft) % 60000) / 1000);
                const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
                
                timerDisplay = `<span class="text-danger fw-bold">Giữ chỗ: ${formattedTime}</span>`;
                badgeHtml = `<span class="pill-status" style="background: #fff3e0; color: #ea580c;">Đã có người nhận</span>`;
                
                if (isAdmin) {
                    actionButtonHtml = `<button class="btn-outline-custom text-danger" onclick="adminForceDelete('${food._id}')">Cưỡng chế xóa</button>`;
                } else if (isClaimedByMe) {
                    actionButtonHtml = `
                        <div class="d-flex gap-2">
                            <button class="btn-outline-custom text-secondary" onclick="cancelClaimFood('${food._id}')">Hủy</button>
                            <button class="btn-submit" style="padding: 10px; margin-top: 0;" onclick="finishClaim('${food._id}')">Đã lấy xong</button>
                        </div>
                    `;
                } else if (isMyPost) {
                    actionButtonHtml = `<div class="text-center small text-secondary"><strong>${food.reservedBy}</strong> đang đến lấy.</div>`;
                }
            }
        } else {
            if (isAdmin) {
                actionButtonHtml = `<button class="btn-outline-custom text-danger" onclick="adminForceDelete('${food._id}')">Cưỡng chế xóa</button>`;
            } else if (savedRole === 'NGƯỜI NHẬN') {
                actionButtonHtml = `<button class="btn-submit" style="padding: 12px; margin-top: 0;" onclick="claimFood('${food._id}')">Nhận Ngay</button>`;
            } else {
                actionButtonHtml = `<button class="btn-outline-custom text-danger" onclick="deleteFood('${food._id}')">Gỡ bài</button>`;
            }
        }
        
        const quantityBadge = food.quantity ? `<span class="badge bg-success ms-2 rounded-pill" style="font-size: 0.75rem;">SL: ${food.quantity}</span>` : '';
        const descriptionDisplay = food.description ? `<p class="text-muted small mb-2" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${food.description}</p>` : '';
        
        html += `
            <div class="col-md-6 mb-4">
                <div class="food-card">
                    <div class="food-img-wrapper">
                       <img src="${food.image || 'https://images.unsplash.com/photo-1490818387583-1baba5e638cb?q=80&w=600'}" alt="${food.title}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1490818387583-1baba5e638cb?q=80&w=600';">
                    </div>
                    <div class="p-4 d-flex flex-column flex-grow-1">
                        <div class="mb-3">${badgeHtml}</div>
                        <h5 class="title mb-2" style="font-size: 1.1rem; line-height: 1.4;">${food.title} ${quantityBadge}</h5>
                        ${descriptionDisplay}
                        <p class="text-muted small mb-3">Đăng bởi: <strong>${food.donor}</strong></p>
                        
                        <div class="d-flex flex-column gap-2 mt-auto mb-4">
                            <div class="d-flex align-items-center gap-2 small text-secondary">
                                <i class="bi bi-geo-alt-fill text-danger"></i> <span>${food.location}</span>
                            </div>
                            <div class="d-flex align-items-center gap-2 small text-secondary">
                                <i class="bi bi-clock-history text-primary"></i> <span>${timerDisplay}</span>
                            </div>
                        </div>
                        <div>${actionButtonHtml}</div>
                    </div>
                </div>
            </div>
        `;
    });
    if(container.innerHTML !== html) container.innerHTML = html;
}

async function updateFoodAPI(id, data, successMsg, type = 'success') {
    try {
        await fetch(`${API_URL}/food/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        loadAllFoodsData();
        if(successMsg) showToast(successMsg, type);
    } catch (error) { showToast("Có lỗi xảy ra", "danger"); }
}

async function deleteFoodAPI(id, successMsg, type = 'warning') {
    try {
        await fetch(`${API_URL}/food/${id}`, { method: 'DELETE' });
        loadAllFoodsData();
        if(successMsg) showToast(successMsg, type);
    } catch (error) { showToast("Có lỗi xảy ra", "danger"); }
}

function claimFood(id) {
    const savedName = localStorage.getItem('savedUsername');
    updateFoodAPI(id, { status: 'reserved', reservedBy: savedName, reservedAt: new Date() }, "Giữ chỗ thành công!");
}

function cancelClaimFood(id) { updateFoodAPI(id, { status: 'available', reservedBy: null, reservedAt: null }, "Đã hủy nhận", "warning"); }

function finishClaim(id) { updateFoodAPI(id, { status: 'pending_confirmation' }, "Đã báo lấy! Chờ duyệt."); }

function cancelPending(id) { updateFoodAPI(id, { status: 'available', reservedBy: null, reservedAt: null }, "Đã từ chối xác nhận.", "warning"); }

function handleFormSubmit(e) {
    e.preventDefault(); 
    const savedName = localStorage.getItem('savedUsername');
    const name = document.getElementById('tenThucPham').value;
    const moTa = document.getElementById('moTa').value;
    const soLuong = document.getElementById('soLuong').value;
    const hanDung = document.getElementById('hanDung').value;
    const address = document.getElementById('diaChi').value;
    const fileInput = document.getElementById('hinhAnh');
    
    const createNewPost = async (imageBase64) => {
        const newPost = {
            title: name, 
            description: moTa, 
            quantity: soLuong,
            expiryDate: hanDung,
            location: address, 
            image: imageBase64, 
            donor: savedName,
            status: 'available'
        };
        try {
            await fetch(`${API_URL}/food`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPost)
            });
            loadAllFoodsData(); 
            showToast("Đăng bài thành công!");
            document.getElementById('foodForm').reset();
        } catch (error) { showToast("Lỗi đăng bài", "danger"); }
    };
    
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) { createNewPost(e.target.result); };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        createNewPost(""); 
    }
}

function deleteFood(id) { if(confirm("Gỡ bản tin này?")) deleteFoodAPI(id, "Đã gỡ bản tin"); }

function adminForceDelete(id) { if(confirm("Xác nhận CƯỠNG CHẾ XÓA bài đăng này?")) deleteFoodAPI(id, "Đã xóa bài vi phạm", "danger"); }

function confirmGiven(id) {
    let rescues = parseInt(localStorage.getItem('food_stats_rescues') || '0');
    localStorage.setItem('food_stats_rescues', rescues + 1);
    deleteFoodAPI(id, "Đã xác nhận hoàn thành.", "success");
}

async function updateAdminStats() {
    const statUsers = document.getElementById('statUsers');
    const statPosts = document.getElementById('statPosts');
    const statRescues = document.getElementById('statRescues');
    
    try {
        const res = await fetch(`${API_URL}/auth/users`);
        if(res.ok) {
            const users = await res.json();
            if(statUsers) statUsers.textContent = users.length;
        }
    } catch(e) {}
    
    if(statPosts) statPosts.textContent = realFoods.length;
    if(statRescues) statRescues.textContent = localStorage.getItem('food_stats_rescues') || '0';
}

function switchAdminView(view) {
    currentAdminView = view;
    if(view === 'POSTS') loadAllFoodsData();
    else if (view === 'USERS') renderUsersList();
}

async function renderUsersList() {
    const container = document.getElementById('foodContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="col-12 text-center mt-5"><div class="spinner-border text-primary"></div><p class="mt-2">Đang tải...</p></div>';
    try {
        const res = await fetch(`${API_URL}/auth/users`);
        if (!res.ok) throw new Error('Network error');
        const realUsers = await res.json();
        let html = `
            <div class="col-12 mb-3 d-flex justify-content-between align-items-center">
                <h4 class="mb-0">Danh sách tài khoản</h4>
                <div class="input-group" style="width: 300px;">
                    <input type="text" id="adminSearchEmail" class="form-control" placeholder="Tìm theo Email...">
                    <button class="btn btn-primary" onclick="searchAdminUser()"><i class="bi bi-search"></i></button>
                </div>
            </div>
            <div class="col-12">
                <div class="main-card p-0" style="overflow: hidden;">
                    <table class="table mb-0 align-middle">
                        <thead class="table-light">
                            <tr>
                                <th class="ps-4 py-3">Email/Tên</th>
                                <th>Vai trò</th>
                                <th>Ngày tạo</th>
                                <th>Trạng thái</th>
                                <th class="text-end pe-4">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody id="userTableBody">
        `;
        
        realUsers.forEach(user => {
            const dateStr = user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A';
            html += `
                <tr>
                    <td class="ps-4 fw-bold">${user.email}</td>
                    <td>${user.role || 'Chưa phân quyền'}</td>
                    <td>${dateStr}</td>
                    <td><span class="badge bg-success">Active</span></td>
                    <td class="text-end pe-4">
                        ${user.role !== 'ADMIN' ? `<button class="btn btn-sm btn-outline-danger">Khóa</button>` : '<span class="text-muted small">Quản trị</span>'}
                    </td>
                </tr>
            `;
        });
        
        html += `</tbody></table></div></div>`;
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = `<div class="col-12 text-center text-danger mt-5">Lỗi kết nối máy chủ!</div>`;
    }
}

function searchAdminUser() {
    const keyword = document.getElementById('adminSearchEmail').value.toLowerCase();
    const rows = document.getElementById('userTableBody').querySelectorAll('tr');
    rows.forEach(row => {
        const emailCell = row.querySelector('td').textContent.toLowerCase();
        row.style.display = emailCell.includes(keyword) ? '' : 'none';
    });
}

function handleLogout() {
    if(confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        localStorage.removeItem('savedUsername');
        localStorage.removeItem('savedRole');
        window.location.href = "login.html"; 
    }
}