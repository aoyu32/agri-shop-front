-- AI咨询模块数据库表设计（简化版）

-- 1. AI会话表（ai_conversations）
-- 存储用户与AI的会话记录
CREATE TABLE `ai_conversations` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '会话ID',
  `user_id` bigint(20) UNSIGNED NOT NULL COMMENT '用户ID',
  `conversation_id` varchar(100) DEFAULT NULL COMMENT 'Coze会话ID',
  `title` varchar(200) DEFAULT '新对话' COMMENT '会话标题（自动生成或用户自定义）',
  `message_count` int(11) DEFAULT 0 COMMENT '消息数量',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：1-进行中 0-已结束',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_conversation_id` (`conversation_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI会话表';

-- 2. AI消息表（ai_messages）
-- 存储会话中的每条消息
CREATE TABLE `ai_messages` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '消息ID',
  `conversation_id` bigint(20) UNSIGNED NOT NULL COMMENT '会话ID',
  `user_id` bigint(20) UNSIGNED NOT NULL COMMENT '用户ID',
  `role` enum('user','assistant','system') NOT NULL COMMENT '角色：user-用户 assistant-AI system-系统',
  `content` text NOT NULL COMMENT '消息内容',
  `content_type` enum('text','image','mixed') DEFAULT 'text' COMMENT '内容类型：text-文本 image-图片 mixed-图文混合',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_conversation_id` (`conversation_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI消息表';
