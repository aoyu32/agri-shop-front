-- 消息通知表
CREATE TABLE `notifications` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '通知ID',
  `user_id` bigint UNSIGNED NOT NULL COMMENT '接收用户ID',
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '通知类型：order-订单通知 review-评价通知 reply-回复通知 system-系统通知',
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '通知标题',
  `content` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '通知内容',
  `related_id` bigint UNSIGNED DEFAULT NULL COMMENT '关联ID（订单ID、评价ID等）',
  `related_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '关联类型：order-订单 review-评价',
  `is_read` tinyint NOT NULL DEFAULT 0 COMMENT '是否已读：0-未读 1-已读',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id` (`user_id` ASC) USING BTREE,
  INDEX `idx_type` (`type` ASC) USING BTREE,
  INDEX `idx_is_read` (`is_read` ASC) USING BTREE,
  INDEX `idx_created_at` (`created_at` ASC) USING BTREE,
  INDEX `idx_related` (`related_type` ASC, `related_id` ASC) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息通知表' ROW_FORMAT=Dynamic;

-- 通知类型说明：
-- order: 订单相关通知（新订单、发货、完成等）
-- review: 评价通知（用户评价商品）
-- reply: 回复通知（商家回复评价）
-- system: 系统通知

-- 使用场景：
-- 1. 消费者下单 -> 通知农户（type=order, title=新订单通知）
-- 2. 农户发货 -> 通知消费者（type=order, title=订单发货通知）
-- 3. 消费者评价 -> 通知农户（type=review, title=新评价通知）
-- 4. 农户回复评价 -> 通知消费者（type=reply, title=商家回复）
