-- LifeGit Fork功能数据库迁移脚本
-- 执行前请备份数据库

-- 1. repo表新增字段(支持fork关系和状态)
ALTER TABLE repo ADD COLUMN parent_repo_id BIGINT NULL COMMENT 'fork来源仓库ID,NULL表示原始仓库';
ALTER TABLE repo ADD COLUMN fork_depth INT NOT NULL DEFAULT 0 COMMENT 'fork深度,0为原始仓库';
ALTER TABLE repo ADD COLUMN status ENUM('active','transferred') NOT NULL DEFAULT 'active' COMMENT '仓库状态:active活跃/transferred已转让';

-- 为parent_repo_id加索引(查询fork图谱用)
CREATE INDEX idx_repo_parent ON repo(parent_repo_id);

-- 2. 创建transfer表(记录转让流程)
CREATE TABLE IF NOT EXISTS transfer (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  repo_id BIGINT NOT NULL COMMENT '被转让的仓库ID',
  from_user_id BIGINT NOT NULL COMMENT '发起转让的用户ID',
  to_user_id BIGINT NULL COMMENT '接收方用户ID,接收前为NULL',
  transfer_code VARCHAR(32) NOT NULL UNIQUE COMMENT '转让码,用于生成链接',
  status ENUM('pending','accepted','declined','expired') NOT NULL DEFAULT 'pending' COMMENT '转让状态',
  message TEXT NULL COMMENT '转让留言',
  new_repo_id BIGINT NULL COMMENT '接收后创建的新仓库ID',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发起时间',
  accepted_at DATETIME NULL COMMENT '接收/拒绝时间',
  INDEX idx_transfer_repo (repo_id),
  INDEX idx_transfer_code (transfer_code),
  INDEX idx_transfer_from (from_user_id),
  INDEX idx_transfer_to (to_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物品转让记录表';
