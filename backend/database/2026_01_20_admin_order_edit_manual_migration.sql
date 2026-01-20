-- Admin Order Editing Feature - Manual Migration SQL
-- Created: 2026-01-20

-- 1. Create order_edit_logs table
CREATE TABLE IF NOT EXISTS `order_edit_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `action` enum('update_info','add_item','remove_item','update_item','update_status','recalculate_discount','adjustment_resolved') COLLATE utf8mb4_unicode_ci NOT NULL,
  `field_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `old_value` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_value` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_edit_logs_order_id_index` (`order_id`),
  KEY `order_edit_logs_created_at_index` (`created_at`),
  CONSTRAINT `order_edit_logs_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_edit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Add edit tracking columns to orders table
ALTER TABLE `orders` 
ADD COLUMN IF NOT EXISTS `price_adjustment_status` enum('none','overpaid','underpaid') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'none' AFTER `grand_total`,
ADD COLUMN IF NOT EXISTS `price_adjustment_amount` decimal(12,2) NOT NULL DEFAULT '0.00' AFTER `price_adjustment_status`,
ADD COLUMN IF NOT EXISTS `last_edited_at` timestamp NULL DEFAULT NULL AFTER `price_adjustment_amount`,
ADD COLUMN IF NOT EXISTS `last_edited_by` bigint(20) unsigned DEFAULT NULL AFTER `last_edited_at`,
ADD CONSTRAINT `orders_last_edited_by_foreign` FOREIGN KEY (`last_edited_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
