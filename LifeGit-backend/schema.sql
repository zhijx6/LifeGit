-- ============================================================
-- LifeGit 数据库初始化脚本
-- 创建数据库 lifegit 及 7 张核心表
-- 使用方法: mysql -u root -p < schema.sql
-- ============================================================

DROP DATABASE IF EXISTS lifegit;
CREATE DATABASE lifegit DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lifegit;

-- ============================================================
-- 1. 用户表
-- ============================================================
CREATE TABLE `user` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `openid` VARCHAR(64) NOT NULL UNIQUE COMMENT '微信openid或本地生成的唯一标识',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `password_hash` VARCHAR(128) NOT NULL COMMENT '盐值$SHA256哈希',
  `nickname` VARCHAR(50) NOT NULL COMMENT '昵称',
  `avatar` VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
  `status` ENUM('active','disabled') NOT NULL DEFAULT 'active' COMMENT '账号状态',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login_time` DATETIME DEFAULT NULL,
  INDEX `idx_phone` (`phone`),
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ============================================================
-- 2. 仓库表(物品/地点实体)
-- ============================================================
CREATE TABLE `repo` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `product_name` VARCHAR(200) NOT NULL COMMENT '产品名',
  `brand` VARCHAR(100) DEFAULT '' COMMENT '品牌',
  `model` VARCHAR(100) DEFAULT '' COMMENT '型号',
  `specification` VARCHAR(200) DEFAULT '' COMMENT '规格',
  `main_image` VARCHAR(500) DEFAULT '' COMMENT '主图URL',
  `name` VARCHAR(200) NOT NULL COMMENT '仓库名称',
  `type` ENUM('item','place') NOT NULL DEFAULT 'item' COMMENT '类型:item=物品,place=地点',
  `description` TEXT COMMENT '描述',
  `cover_image` VARCHAR(500) DEFAULT '' COMMENT '封面图URL',
  `creator_id` BIGINT NOT NULL COMMENT '创建者ID',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `parent_repo_id` BIGINT NULL COMMENT 'fork来源仓库ID,NULL表示原始仓库',
  `fork_depth` INT NOT NULL DEFAULT 0 COMMENT 'fork深度,0为原始仓库',
  `status` ENUM('active','transferred') NOT NULL DEFAULT 'active' COMMENT '仓库状态:active活跃/transferred已转让',
  INDEX `idx_creator` (`creator_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_repo_parent` (`parent_repo_id`),
  CONSTRAINT `fk_repo_user` FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='仓库表';

-- ============================================================
-- 3. 事件表(结构化生命周期记录)
-- ============================================================
CREATE TABLE `event` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `repo_id` BIGINT NOT NULL COMMENT '所属仓库ID',
  `event_type` VARCHAR(30) NOT NULL COMMENT '事件类型:purchase/maintenance/upgrade/experience/memory/fault/transfer/visit/review/info_change/wishlist',
  `content` JSON COMMENT '结构化事件内容',
  `images` JSON DEFAULT NULL COMMENT '图片URL列表',
  `user_id` BIGINT NOT NULL COMMENT '创建者ID',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_repo` (`repo_id`),
  INDEX `idx_type` (`event_type`),
  INDEX `idx_user` (`user_id`),
  CONSTRAINT `fk_event_repo` FOREIGN KEY (`repo_id`) REFERENCES `repo`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_event_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='事件表';

-- ============================================================
-- 4. Issue 问答表
-- ============================================================
CREATE TABLE `issue` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `repo_id` BIGINT NOT NULL COMMENT '所属仓库ID',
  `title` VARCHAR(200) NOT NULL COMMENT '问题标题',
  `content` TEXT NOT NULL COMMENT '问题内容',
  `status` ENUM('open','answered','closed') NOT NULL DEFAULT 'open' COMMENT '状态',
  `creator_id` BIGINT NOT NULL COMMENT '提问者ID',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_repo` (`repo_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_creator` (`creator_id`),
  CONSTRAINT `fk_issue_repo` FOREIGN KEY (`repo_id`) REFERENCES `repo`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_issue_user` FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Issue 问答表';

-- ============================================================
-- 5. Reply 回复表
-- ============================================================
CREATE TABLE `reply` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `issue_id` BIGINT NOT NULL COMMENT '所属Issue ID',
  `content` TEXT NOT NULL COMMENT '回复内容',
  `author_id` BIGINT NOT NULL COMMENT '回复者ID',
  `is_best_answer` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否最佳答案:0=否,1=是',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_issue` (`issue_id`),
  INDEX `idx_author` (`author_id`),
  CONSTRAINT `fk_reply_issue` FOREIGN KEY (`issue_id`) REFERENCES `issue`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reply_user` FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='回复表';

-- ============================================================
-- 6. Mention @提醒表
-- ============================================================
CREATE TABLE `mention` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `reply_id` BIGINT NOT NULL COMMENT '所属回复ID',
  `mentioned_user_id` BIGINT NOT NULL COMMENT '被@用户ID',
  `is_read` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已读:0=未读,1=已读',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_reply` (`reply_id`),
  INDEX `idx_mentioned_user` (`mentioned_user_id`),
  INDEX `idx_is_read` (`is_read`),
  CONSTRAINT `fk_mention_reply` FOREIGN KEY (`reply_id`) REFERENCES `reply`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mention_user` FOREIGN KEY (`mentioned_user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='@提醒表';

-- ============================================================
-- 7. Transfer 物品转让记录表
-- ============================================================
CREATE TABLE `transfer` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `repo_id` BIGINT NOT NULL COMMENT '被转让的仓库ID',
  `from_user_id` BIGINT NOT NULL COMMENT '发起转让的用户ID',
  `to_user_id` BIGINT NULL COMMENT '接收方用户ID,接收前为NULL',
  `transfer_code` VARCHAR(32) NOT NULL UNIQUE COMMENT '转让码,用于生成链接',
  `status` ENUM('pending','accepted','declined','expired') NOT NULL DEFAULT 'pending' COMMENT '转让状态',
  `message` TEXT NULL COMMENT '转让留言',
  `new_repo_id` BIGINT NULL COMMENT '接收后创建的新仓库ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发起时间',
  `accepted_at` DATETIME NULL COMMENT '接收/拒绝时间',
  INDEX `idx_transfer_repo` (`repo_id`),
  INDEX `idx_transfer_code` (`transfer_code`),
  INDEX `idx_transfer_from` (`from_user_id`),
  INDEX `idx_transfer_to` (`to_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物品转让记录表';

-- ============================================================
-- 完成
-- ============================================================
SELECT 'LifeGit 数据库初始化完成' AS message;
SHOW TABLES;
