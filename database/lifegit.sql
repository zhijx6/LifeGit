-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: lifegit
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `lifegit`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `lifegit` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `lifegit`;

--
-- Table structure for table `event`
--

DROP TABLE IF EXISTS `event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '事件ID',
  `repo_id` int NOT NULL COMMENT '所属仓库ID',
  `event_type` enum('purchase','maintenance','upgrade','experience','memory','fault','transfer','visit','review','info_change','wishlist') NOT NULL,
  `content` json NOT NULL COMMENT '结构化事件内容',
  `images` json DEFAULT NULL COMMENT '图片URL数组',
  `user_id` int NOT NULL COMMENT '记录者用户ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_repo_id` (`repo_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='事件表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event`
--

LOCK TABLES `event` WRITE;
/*!40000 ALTER TABLE `event` DISABLE KEYS */;
INSERT INTO `event` VALUES (14,7,'purchase','{\"price\": 600, \"channel\": \"其他\", \"purchase_date\": \"2025-06-23\", \"initial_experience\": \"看起来有点旧，后座没有挡板，第一次有车很兴奋\"}',NULL,3,'2026-04-23 17:17:44'),(15,7,'maintenance','{\"cost\": 40, \"maintenance_date\": \"2025-12-19\", \"maintenance_type\": \"更换配件\", \"service_provider\": \"校内维修店\", \"maintenance_project\": \"换轮胎\"}',NULL,3,'2026-04-23 17:18:46'),(16,7,'experience','{\"rating\": 2, \"content\": \"半路没电\\n以为当时电足够，但是走到半路没电了\", \"experience_date\": \"2026-04-23\"}',NULL,3,'2026-04-23 17:20:08'),(17,8,'visit','{\"wait_time\": \"over_30\", \"visit_date\": \"2026-03-29\", \"amount_paid\": 400}',NULL,3,'2026-04-23 17:31:00'),(18,8,'review','{\"taste_rating\": 5, \"detail_review\": \"\", \"overall_rating\": \"recommend\", \"service_rating\": 5, \"disliked_dishes\": [\"丝瓜\"], \"per_capita_cost\": 102, \"environment_rating\": 5, \"recommended_dishes\": [\"燃抄\", \"凉拌折耳根\"]}',NULL,3,'2026-04-23 17:32:18');
/*!40000 ALTER TABLE `event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `issue`
--

DROP TABLE IF EXISTS `issue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `issue` (
  `id` int NOT NULL AUTO_INCREMENT,
  `repo_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `status` enum('open','answered','closed') NOT NULL DEFAULT 'open',
  `creator_id` int NOT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `repo_id` (`repo_id`),
  KEY `creator_id` (`creator_id`),
  CONSTRAINT `issue_ibfk_1` FOREIGN KEY (`repo_id`) REFERENCES `repo` (`id`),
  CONSTRAINT `issue_ibfk_2` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `issue`
--

LOCK TABLES `issue` WRITE;
/*!40000 ALTER TABLE `issue` DISABLE KEYS */;
/*!40000 ALTER TABLE `issue` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mention`
--

DROP TABLE IF EXISTS `mention`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mention` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reply_id` int NOT NULL,
  `mentioned_user_id` int NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `reply_id` (`reply_id`),
  KEY `mentioned_user_id` (`mentioned_user_id`),
  CONSTRAINT `mention_ibfk_1` FOREIGN KEY (`reply_id`) REFERENCES `reply` (`id`) ON DELETE CASCADE,
  CONSTRAINT `mention_ibfk_2` FOREIGN KEY (`mentioned_user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mention`
--

LOCK TABLES `mention` WRITE;
/*!40000 ALTER TABLE `mention` DISABLE KEYS */;
/*!40000 ALTER TABLE `mention` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reply`
--

DROP TABLE IF EXISTS `reply`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reply` (
  `id` int NOT NULL AUTO_INCREMENT,
  `issue_id` int NOT NULL,
  `content` text NOT NULL,
  `author_id` int NOT NULL,
  `is_best_answer` tinyint(1) NOT NULL DEFAULT '0',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `issue_id` (`issue_id`),
  KEY `author_id` (`author_id`),
  CONSTRAINT `reply_ibfk_1` FOREIGN KEY (`issue_id`) REFERENCES `issue` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reply_ibfk_2` FOREIGN KEY (`author_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reply`
--

LOCK TABLES `reply` WRITE;
/*!40000 ALTER TABLE `reply` DISABLE KEYS */;
/*!40000 ALTER TABLE `reply` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `repo`
--

DROP TABLE IF EXISTS `repo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `repo` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '仓库ID',
  `name` varchar(128) NOT NULL COMMENT '仓库名称',
  `product_name` varchar(128) DEFAULT NULL,
  `brand` varchar(64) DEFAULT NULL,
  `model` varchar(64) DEFAULT NULL,
  `specification` varchar(128) DEFAULT NULL,
  `main_image` varchar(512) DEFAULT NULL,
  `type` enum('item','place') NOT NULL COMMENT '类型：item=物品，place=地点',
  `description` text COMMENT '描述',
  `cover_image` varchar(512) DEFAULT NULL COMMENT '封面图URL',
  `creator_id` int NOT NULL COMMENT '创建者用户ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_creator` (`creator_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='仓库表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `repo`
--

LOCK TABLES `repo` WRITE;
/*!40000 ALTER TABLE `repo` DISABLE KEYS */;
INSERT INTO `repo` VALUES (1,'电动车','电动车','新日','TDT5041Z','无','','item','','',1,'2026-04-21 20:42:53'),(7,'电动车','电动车','新日','TDT5041Z','无','/uploads/images/20260423171511_c054ab55-417d-46c0-a9f1-dc146e4c86cc.jpg','item','','/uploads/images/20260423171511_c054ab55-417d-46c0-a9f1-dc146e4c86cc.jpg',3,'2026-04-23 17:15:12'),(8,'北京宜宾招待所','北京宜宾招待所','北京市西城区西中胡同28号','','','/uploads/images/20260423172145_d6c65f16-aa9e-46ed-b345-f282d9ad360d.jpg','place','','/uploads/images/20260423172145_d6c65f16-aa9e-46ed-b345-f282d9ad360d.jpg',3,'2026-04-23 17:21:45');
/*!40000 ALTER TABLE `repo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `openid` varchar(64) NOT NULL COMMENT '微信openid',
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(128) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `status` enum('active','disabled') NOT NULL DEFAULT 'active',
  `last_login_time` datetime DEFAULT NULL,
  `nickname` varchar(64) DEFAULT NULL COMMENT '昵称',
  `avatar` varchar(512) DEFAULT NULL COMMENT '头像URL',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`openid`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'test_openid_001',NULL,NULL,NULL,'active',NULL,'测试用户','https://example.com/avatar.png','2026-04-09 19:03:17'),(2,'local_b4e5ff00a1bc43b9b7892b1c6d0e7520','13800000099',NULL,'0d4b7575b4bcb5f6d3bf80f64c656c5d$230e9653c759876a2efd2ebd7e1c6eeb6914313dc58f2537817ebedfe9f4c362','active',NULL,'test_user',NULL,'2026-04-21 20:31:49'),(3,'local_58dd109064934ed7a2c91cce87367191','15082645217',NULL,'a3c158d8097e88a8e107931ed9e461d5$2f36659e8051b7312c5601fc20aa7ebd0ff878c0f6dd0ce553d5ade757334b12','active','2026-04-25 09:41:17','zhi',NULL,'2026-04-21 20:40:51'),(4,'local_1c80481d2e0448cd8020b32d6f9f0170','12345678',NULL,'97c604811b76357d3690bfbf59ee1aaf$598571aa1a45d855dfd500c3346b208e346e8cc9d11c69d3ff1ae43fc7c48737','active','2026-04-22 19:57:56','12345678',NULL,'2026-04-21 21:34:48');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'lifegit'
--

--
-- Dumping routines for database 'lifegit'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-08 10:24:49
