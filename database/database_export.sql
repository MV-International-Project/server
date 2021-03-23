/*
SQLyog Community v13.1.5  (64 bit)
MySQL - 8.0.21 : Database - int_project
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`int_project` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `int_project`;

/*Table structure for table `discord` */

DROP TABLE IF EXISTS `discord`;

CREATE TABLE `discord` (
  `user_id` varchar(25) NOT NULL,
  `discord_id` varchar(25) NOT NULL,
  `access_token` varchar(40) NOT NULL,
  `refresh_token` varchar(40) NOT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `discord_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `games` */

DROP TABLE IF EXISTS `games`;

CREATE TABLE `games` (
  `game_id` int NOT NULL,
  `name` varchar(70) NOT NULL,
  `image_link` varchar(50) NOT NULL,
  PRIMARY KEY (`game_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `matches` */

DROP TABLE IF EXISTS `matches`;

CREATE TABLE `matches` (
  `first_user` varchar(25) NOT NULL,
  `second_user` varchar(25) NOT NULL,
  `matched_at` datetime DEFAULT NULL,
  PRIMARY KEY (`first_user`,`second_user`),
  KEY `FK_secondUser_matching` (`second_user`),
  CONSTRAINT `FK_firstUser_matching` FOREIGN KEY (`first_user`) REFERENCES `users` (`user_id`),
  CONSTRAINT `FK_secondUser_matching` FOREIGN KEY (`second_user`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `pending_matches` */

DROP TABLE IF EXISTS `pending_matches`;

CREATE TABLE `pending_matches` (
  `first_user` varchar(25) NOT NULL,
  `second_user` varchar(25) NOT NULL,
  `accepted` bit(1) DEFAULT NULL,
  PRIMARY KEY (`first_user`,`second_user`),
  KEY `FK_secondUser_pending` (`second_user`),
  CONSTRAINT `FK_firstUser_pending` FOREIGN KEY (`first_user`) REFERENCES `users` (`user_id`),
  CONSTRAINT `FK_secondUser_pending` FOREIGN KEY (`second_user`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `user_games` */

DROP TABLE IF EXISTS `user_games`;

CREATE TABLE `user_games` (
  `user_id` varchar(25) NOT NULL,
  `game_id` int NOT NULL,
  `hours_played` int DEFAULT NULL,
  `rank` varchar(20) DEFAULT NULL,
  `blacklist` bit(1) DEFAULT NULL,
  PRIMARY KEY (`user_id`,`game_id`),
  KEY `fk_games_userGamer` (`game_id`),
  CONSTRAINT `fk_games_userGamer` FOREIGN KEY (`game_id`) REFERENCES `games` (`game_id`),
  CONSTRAINT `fk_user_userGames` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `user_id` varchar(25) NOT NULL,
  `username` varchar(30) NOT NULL,
  `description` varchar(50) NOT NULL,
  `last_login` datetime NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
