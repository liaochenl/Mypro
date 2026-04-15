// 智算竞赛网站主JavaScript文件

document.addEventListener('DOMContentLoaded', function() {
    // 1. 赛题筛选卡片展开/收起功能
    initTopicCards();

    // 2. 竞赛组织标签页切换功能
    initResourceTabs();

    // 3. 社区规模小组标签页切换
    initCommunityTabs();

    // 4. 获奖作品年份切换
    initYearTabs();

    // 5. 新闻滚动功能
    initNewsScroll();

    // 6. 按钮事件监听
    initButtonEvents();

    // 7. 初始化占位图片的交互提示
    initImagePlaceholders();
});

/**
 * 1. 赛题筛选卡片点击弹出模态框
 */
function initTopicCards() {
    // 获取所有视觉卡片
    const visualCards = document.querySelectorAll('.topic-card.visual-card');
    const modalCloseBtns = document.querySelectorAll('.topic-modal .modal-close');

    // 卡片点击事件
    visualCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // 如果点击的是按钮，不阻止事件冒泡，但让按钮处理
            if (e.target.classList.contains('card-btn') || e.target.closest('.card-btn')) {
                return; // 让按钮的点击事件处理
            }

            const cardId = this.getAttribute('data-card');
            openTopicModal(cardId);
        });

        // 卡片内的按钮点击事件
        const cardBtn = card.querySelector('.card-btn');
        if (cardBtn) {
            cardBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // 阻止事件冒泡到卡片
                const cardId = card.getAttribute('data-card');
                openTopicModal(cardId);
            });
        }
    });

    // 关闭按钮点击事件
    modalCloseBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.topic-modal');
            closeTopicModal(modal);
        });
    });

    // 点击模态框背景关闭
    document.querySelectorAll('.topic-modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeTopicModal(this);
            }
        });
    });

    // 按ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.topic-modal.active').forEach(modal => {
                closeTopicModal(modal);
            });
        }
    });
}

/**
 * 打开赛题模态框
 */
function openTopicModal(cardId) {
    const modal = document.getElementById(`${cardId}-modal`);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // 防止背景滚动
    }
}

/**
 * 关闭赛题模态框
 */
function closeTopicModal(modal) {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // 恢复滚动
    }
}

/**
 * 2. 竞赛组织标签页切换
 */
function initResourceTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');

            // 更新按钮状态
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // 显示对应的内容面板
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === `${tabId}-content`) {
                    pane.classList.add('active');
                }
            });
        });
    });
}

/**
 * 3. 社区规模小组标签页切换
 */
function initCommunityTabs() {
    const communityTabBtns = document.querySelectorAll('.community-card .tab-button');
    const communityTabPanes = document.querySelectorAll('.community-card .tab-pane');

    if (communityTabBtns.length === 0 || communityTabPanes.length === 0) return;

    communityTabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');

            // 更新按钮状态
            communityTabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // 显示对应的内容面板
            communityTabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === `${tabId}-content`) {
                    pane.classList.add('active');
                }
            });
        });
    });
}

/**
 * 3. 获奖作品年份切换
 */
function initYearTabs() {
    const yearBtns = document.querySelectorAll('.year-btn');
    const carouselSlides = document.querySelectorAll('.carousel-slide');

    yearBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const year = this.getAttribute('data-year');

            // 更新按钮状态
            yearBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // 显示对应年份的轮播
            carouselSlides.forEach(slide => {
                slide.classList.remove('active');
                if (slide.getAttribute('data-year') === year) {
                    slide.classList.add('active');
                }
            });
        });
    });
}

/**
 * 4. 新闻滚动功能
 */
function initNewsScroll() {
    const newsScroll = document.getElementById('news-scroll');
    const pauseBtn = document.getElementById('news-pause');
    let isScrolling = true;
    let scrollInterval;

    // 初始化新闻条目
    initNewsItems();

    // 开始滚动
    startNewsScroll();

    // 暂停/继续按钮事件
    if (pauseBtn) {
        pauseBtn.addEventListener('click', function() {
            if (isScrolling) {
                pauseNewsScroll();
                this.innerHTML = '<i class="fas fa-play"></i> 继续';
            } else {
                startNewsScroll();
                this.innerHTML = '<i class="fas fa-pause"></i> 暂停';
            }
            isScrolling = !isScrolling;
        });
    }

    // 添加新闻条目按钮
    const addBtn = document.getElementById('news-add');
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            showAddNewsModal();
        });
    }

    // 鼠标悬停暂停滚动
    newsScroll.addEventListener('mouseenter', pauseNewsScroll);
    newsScroll.addEventListener('mouseleave', function() {
        if (isScrolling) {
            startNewsScroll();
        }
    });

    function startNewsScroll() {
        clearInterval(scrollInterval);
        scrollInterval = setInterval(() => {
            if (newsScroll.scrollTop + newsScroll.clientHeight >= newsScroll.scrollHeight - 10) {
                // 滚动到底部时回到顶部
                newsScroll.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } else {
                newsScroll.scrollBy({
                    top: 1,
                    behavior: 'smooth'
                });
            }
        }, 50);
    }

    function pauseNewsScroll() {
        clearInterval(scrollInterval);
    }
}

/**
 * 初始化新闻条目（从data/news.json加载）
 */
function initNewsItems() {
    // 这里可以加载JSON数据，暂时使用硬编码
    // 实际使用时可以通过fetch加载
    const newsData = [
        {
            title: "AI for Science！'大湾区杯'竞赛重磅来袭！",
            date: "2025-04-01",
            desc: "首届大湾区杯AI for Science竞赛正式启动报名。",
            link: "https://mp.weixin.qq.com/s/Q6k6sbQZv5eLXd6-KmLiFQ"
        },
        {
            title: "AI for Science|'大湾区杯'科技竞赛正式开赛！",
            date: "2025-03-15",
            desc: "第二届大湾区杯科技竞赛正式拉开帷幕。",
            link: "https://mp.weixin.qq.com/s/-5oy-xhbZxZnjQl-pfKrBg"
        },
        {
            title: "2023年'大湾区杯'AI for Science竞赛获奖名单出炉~",
            date: "2024-12-20",
            desc: "首届竞赛获奖名单正式公布，多所高校获奖。",
            link: "https://mp.weixin.qq.com/s/4lgri33ZxzBuWBwzaFUHQQ"
        },
        {
            title: "首届'大湾区杯'粤港澳 AI for Science科技竞赛颁奖典礼隆重举行",
            date: "2024-11-10",
            desc: "颁奖典礼在广州成功举办，多位嘉宾出席。",
            link: "https://mp.weixin.qq.com/s/Qyykzvn-yLY0OR9JLaEg6w"
        },
        {
            title: "高获奖率！丰厚奖金！第二届 '大湾区杯'AI for Science科技竞赛来袭！",
            date: "2024-10-05",
            desc: "第二届竞赛启动，提供丰厚奖金和高获奖率。",
            link: "https://mp.weixin.qq.com/s/LnkCPgeaNW8wQ5zZNqai3g"
        }
    ];

    // 如果已经有新闻条目，则不重复添加
    const newsContainer = document.getElementById('news-scroll');
    if (newsContainer.children.length === 0) {
        newsData.forEach(item => {
            const newsItem = document.createElement('div');
            newsItem.className = 'news-item';
            newsItem.innerHTML = `
                <h4>${item.title}</h4>
                <p class="news-date">${item.date}</p>
                <p class="news-desc">${item.desc}</p>
                <a href="${item.link}" target="_blank" class="news-link">查看详情</a>
            `;
            newsContainer.appendChild(newsItem);
        });
    }
}

/**
 * 显示添加新闻条目的模态框
 */
function showAddNewsModal() {
    const modalHtml = `
        <div class="modal-overlay" id="news-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>添加新闻条目</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="add-news-form">
                        <div class="form-group">
                            <label for="news-title">标题</label>
                            <input type="text" id="news-title" required>
                        </div>
                        <div class="form-group">
                            <label for="news-date">日期</label>
                            <input type="date" id="news-date" required>
                        </div>
                        <div class="form-group">
                            <label for="news-desc">描述</label>
                            <textarea id="news-desc" rows="3" required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="news-link">链接</label>
                            <input type="url" id="news-link" required>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-cancel">取消</button>
                            <button type="submit" class="btn-submit">添加</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    // 添加模态框到页面
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        .modal-content {
            background-color: white;
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid #e8e8e8;
        }
        .modal-header h3 {
            margin: 0;
            color: #262626;
        }
        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #8c8c8c;
        }
        .modal-body {
            padding: 1.5rem;
        }
        .form-group {
            margin-bottom: 1rem;
        }
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            color: #262626;
            font-weight: 500;
        }
        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #d9d9d9;
            border-radius: 6px;
            font-family: inherit;
        }
        .form-actions {
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
        }
        .btn-cancel, .btn-submit {
            flex: 1;
            padding: 0.75rem;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            font-family: inherit;
            font-weight: 500;
        }
        .btn-cancel {
            background-color: #f5f5f5;
            color: #262626;
        }
        .btn-submit {
            background-color: #1890ff;
            color: white;
        }
    `;
    document.head.appendChild(style);

    // 事件监听
    const modal = document.getElementById('news-modal');
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('.btn-cancel');
    const form = document.getElementById('add-news-form');

    // 关闭模态框
    function closeModal() {
        modal.remove();
        style.remove();
    }

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // 表单提交
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const title = document.getElementById('news-title').value;
        const date = document.getElementById('news-date').value;
        const desc = document.getElementById('news-desc').value;
        const link = document.getElementById('news-link').value;

        // 创建新的新闻条目
        const newsContainer = document.getElementById('news-scroll');
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';
        newsItem.innerHTML = `
            <h4>${title}</h4>
            <p class="news-date">${date}</p>
            <p class="news-desc">${desc}</p>
            <a href="${link}" target="_blank" class="news-link">查看详情</a>
        `;

        // 添加到顶部
        newsContainer.insertBefore(newsItem, newsContainer.firstChild);

        // 关闭模态框
        closeModal();

        // 显示成功消息
        alert('新闻条目添加成功！');
    });

    // 设置默认日期为今天
    document.getElementById('news-date').valueAsDate = new Date();
}

/**
 * 5. 初始化按钮事件
 */
function initButtonEvents() {
    // 所有加入按钮（微信交流群）
    document.querySelectorAll('.join-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            alert('微信交流群加入功能将在后续版本中实现。\n\n当前版本为演示版，您可以关注页面底部的官方链接获取最新信息。');
        });
    });

    // 社区规模小组的官方社区链接
    document.querySelectorAll('.group-link').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#' || !this.getAttribute('href')) {
                e.preventDefault();
                alert('官方社区链接功能将在后续版本中实现。\n\n当前版本为演示版，您可以关注页面底部的官方链接获取最新信息。');
            }
        });
    });

    // 优秀成果展示的论文标题链接
    document.querySelectorAll('.paper-title').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#' || !this.getAttribute('href')) {
                e.preventDefault();
                alert('论文详情页面正在建设中，敬请期待。\n\n当前版本为演示版，论文链接功能将在后续版本中实现。');
            }
        });
    });

    // 竞赛组织部分的资源列表项（只处理没有链接的项）
    document.querySelectorAll('.resource-list li').forEach(item => {
        const link = item.querySelector('a');
        if (!link) {
            item.addEventListener('click', function() {
                const text = this.textContent;
                alert(`资源详情页面正在建设中。\n\n资源名称：${text}\n\n当前版本为演示版，资源链接功能将在后续版本中实现。`);
            });
        }
    });

    // 所有外部链接添加提示
    document.querySelectorAll('a[target="_blank"]').forEach(link => {
        link.addEventListener('click', function() {
            // 可以添加统计或确认逻辑
            console.log('打开外部链接:', this.href);
        });
    });
}

/**
 * 6. 初始化占位图片的交互提示
 */
function initImagePlaceholders() {
    const placeholders = document.querySelectorAll('.placeholder-img, .award-img, .case-img');

    placeholders.forEach(placeholder => {
        placeholder.addEventListener('click', function() {
            const hint = this.querySelector('.upload-hint');
            if (hint) {
                alert('此图片为占位图，可以通过图片上传接口替换。\n\n请访问页面底部的"图片上传接口"部分，或直接访问 upload.html 页面上传本地图片。');
            }
        });

        // 添加悬停效果
        placeholder.addEventListener('mouseenter', function() {
            this.style.borderColor = '#1890ff';
            this.style.backgroundColor = '#f0f9ff';
            this.style.cursor = 'pointer';
        });

        placeholder.addEventListener('mouseleave', function() {
            this.style.borderColor = '#d9d9d9';
            this.style.backgroundColor = '#f8f9fa';
        });
    });
}

/**
 * 工具函数：从JSON文件加载数据
 */
async function loadJSONData(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('加载JSON数据失败:', error);
        return null;
    }
}

/**
 * 工具函数：保存数据到JSON文件
 * 注意：由于浏览器安全限制，无法直接写入文件
 * 实际项目中需要后端支持或使用localStorage
 */
function saveDataToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('保存数据到localStorage失败:', error);
        return false;
    }
}

/**
 * 工具函数：从localStorage加载数据
 */
function loadDataFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('从localStorage加载数据失败:', error);
        return null;
    }
}

// 导出函数供其他模块使用（如果使用模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initTopicCards,
        initResourceTabs,
        initYearTabs,
        initNewsScroll
    };
}