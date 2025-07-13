-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: alquiler_autos
-- ------------------------------------------------------
-- Server version	8.0.42

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
-- Table structure for table `administrador`
--

DROP TABLE IF EXISTS `administrador`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `administrador` (
  `id` int NOT NULL,
  `numero_empleado` varchar(50) NOT NULL,
  `sucursal_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_empleado` (`numero_empleado`),
  KEY `sucursal_id` (`sucursal_id`),
  CONSTRAINT `administrador_ibfk_1` FOREIGN KEY (`id`) REFERENCES `usuario` (`id`),
  CONSTRAINT `administrador_ibfk_2` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `administrador`
--

LOCK TABLES `administrador` WRITE;
/*!40000 ALTER TABLE `administrador` DISABLE KEYS */;
/*!40000 ALTER TABLE `administrador` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alembic_version`
--

DROP TABLE IF EXISTS `alembic_version`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alembic_version` (
  `version_num` varchar(32) NOT NULL,
  PRIMARY KEY (`version_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alembic_version`
--

LOCK TABLES `alembic_version` WRITE;
/*!40000 ALTER TABLE `alembic_version` DISABLE KEYS */;
/*!40000 ALTER TABLE `alembic_version` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empleado`
--

DROP TABLE IF EXISTS `empleado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empleado` (
  `id` int NOT NULL,
  `numero_empleado` varchar(50) NOT NULL,
  `sucursal_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sucursal_id` (`sucursal_id`),
  CONSTRAINT `empleado_ibfk_1` FOREIGN KEY (`id`) REFERENCES `usuario` (`id`),
  CONSTRAINT `empleado_ibfk_2` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursal` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empleado`
--

LOCK TABLES `empleado` WRITE;
/*!40000 ALTER TABLE `empleado` DISABLE KEYS */;
/*!40000 ALTER TABLE `empleado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado`
--

DROP TABLE IF EXISTS `estado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 ;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado`
--

LOCK TABLES `estado` WRITE;
/*!40000 ALTER TABLE `estado` DISABLE KEYS */;
INSERT INTO `estado` VALUES (1,'Disponible'),(2,'Reservado'),(3,'En mantenimiento');
/*!40000 ALTER TABLE `estado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `extras`
--

DROP TABLE IF EXISTS `extras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `extras` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` text NOT NULL,
  `descripcion` text,
  `precio` double NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `extras`
--

LOCK TABLES `extras` WRITE;
/*!40000 ALTER TABLE `extras` DISABLE KEYS */;
/*!40000 ALTER TABLE `extras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `politica_cancelacion`
--

DROP TABLE IF EXISTS `politica_cancelacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `politica_cancelacion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `descripcion` text NOT NULL,
  `penalizacion_dias` int NOT NULL,
  `porcentaje_penalizacion` float NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 ;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `politica_cancelacion`
--

LOCK TABLES `politica_cancelacion` WRITE;
/*!40000 ALTER TABLE `politica_cancelacion` DISABLE KEYS */;
INSERT INTO `politica_cancelacion` VALUES (1,'20% de devolución',1,20),(2,'Sin devolución',0,100),(3,'100% de devolución',2,0);
/*!40000 ALTER TABLE `politica_cancelacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reserva`
--

DROP TABLE IF EXISTS `reserva`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reserva` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `vehiculo_id` int NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `estado` varchar(50) NOT NULL,
  `pagada` tinyint(1) DEFAULT NULL,
  `monto_total` float NOT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `vehiculo_id` (`vehiculo_id`),
  CONSTRAINT `reserva_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`),
  CONSTRAINT `reserva_ibfk_2` FOREIGN KEY (`vehiculo_id`) REFERENCES `vehiculo` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reserva`
--

LOCK TABLES `reserva` WRITE;
/*!40000 ALTER TABLE `reserva` DISABLE KEYS */;
/*!40000 ALTER TABLE `reserva` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reserva_extra`
--

DROP TABLE IF EXISTS `reserva_extra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reserva_extra` (
  `reserva_id` int NOT NULL,
  `extra_id` int NOT NULL,
  `cantidad` int DEFAULT '1',
  `precio_unitario` double DEFAULT NULL,
  PRIMARY KEY (`reserva_id`,`extra_id`),
  KEY `extra_id` (`extra_id`),
  CONSTRAINT `reserva_extra_ibfk_1` FOREIGN KEY (`reserva_id`) REFERENCES `reserva` (`id`),
  CONSTRAINT `reserva_extra_ibfk_2` FOREIGN KEY (`extra_id`) REFERENCES `extras` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reserva_extra`
--

LOCK TABLES `reserva_extra` WRITE;
/*!40000 ALTER TABLE `reserva_extra` DISABLE KEYS */;
/*!40000 ALTER TABLE `reserva_extra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sucursal`
--

DROP TABLE IF EXISTS `sucursal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sucursal` (
  `id` int NOT NULL AUTO_INCREMENT,
  `localidad` text NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `nombre` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 ;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sucursal`
--

LOCK TABLES `sucursal` WRITE;
/*!40000 ALTER TABLE `sucursal` DISABLE KEYS */;
INSERT INTO `sucursal` VALUES (1,'Necochea','Dirección automática','0000000000','Sucursal Necochea'),(2,'Villa Gesell','Dirección automática','0000000000','Sucursal Villa Gesell'),(3,'Zárate','Dirección automática','0000000000','Sucursal Zárate'),(4,'San Pedro','Dirección automática','0000000000','Sucursal San Pedro'),(5,'Pinamar','Dirección automática','0000000000','Sucursal Pinamar'),(6,'Bahía Blanca','Dirección automática','0000000000','Sucursal Bahía Blanca'),(7,'Campana','Dirección automática','0000000000','Sucursal Campana'),(8,'Chivilcoy','Dirección automática','0000000000','Sucursal Chivilcoy'),(9,'Olavarría','Dirección automática','0000000000','Sucursal Olavarría'),(10,'Tandil','Dirección automática','0000000000','Sucursal Tandil'),(11,'Balcarce','Dirección automática','0000000000','Sucursal Balcarce'),(12,'Luján','Dirección automática','0000000000','Sucursal Luján'),(13,'Mar del Plata','Dirección automática','0000000000','Sucursal Mar del Plata'),(14,'Pergamino','Dirección automática','0000000000','Sucursal Pergamino'),(15,'Tres Arroyos','Dirección automática','0000000000','Sucursal Tres Arroyos'),(16,'Mercedes','Dirección automática','0000000000','Sucursal Mercedes'),(17,'Junín','Dirección automática','0000000000','Sucursal Junín'),(18,'Azul','Dirección automática','0000000000','Sucursal Azul'),(19,'San Nicolás','Dirección automática','0000000000','Sucursal San Nicolás'),(20,'La Plata','Dirección automática','0000000000','Sucursal La Plata');
/*!40000 ALTER TABLE `sucursal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` text NOT NULL,
  `apellido` text NOT NULL,
  `dni` int NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `email` varchar(120) NOT NULL,
  `contrasena` varchar(100) NOT NULL,
  `es_admin` tinyint(1) DEFAULT NULL,
  `es_empleado` tinyint(1) DEFAULT NULL,
  `activo` boolean DEFAULT TRUE,
  `rol` tinyint(1) DEFAULT 3 COMMENT '3: Cliente, 2: Empleado, 1: Administrador',
  PRIMARY KEY (`id`),
  UNIQUE KEY `dni` (`dni`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehiculo`
--

DROP TABLE IF EXISTS `vehiculo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehiculo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patente` varchar(20) NOT NULL,
  `marca` varchar(50) NOT NULL,
  `modelo` varchar(50) NOT NULL,
  `anio` int NOT NULL,
  `capacidad` int NOT NULL,
  `categoria` varchar(50) NOT NULL,
  `precio_dia` float NOT NULL,
  `sucursal_id` int NOT NULL,
  `politica_cancelacion_id` int NOT NULL,
  `estado_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sucursal_id` (`sucursal_id`),
  KEY `politica_cancelacion_id` (`politica_cancelacion_id`),
  KEY `estado_id` (`estado_id`),
  CONSTRAINT `vehiculo_ibfk_1` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursal` (`id`),
  CONSTRAINT `vehiculo_ibfk_2` FOREIGN KEY (`politica_cancelacion_id`) REFERENCES `politica_cancelacion` (`id`),
  CONSTRAINT `vehiculo_ibfk_3` FOREIGN KEY (`estado_id`) REFERENCES `estado` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=151 DEFAULT CHARSET=utf8mb4 ;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehiculo`
--

LOCK TABLES `vehiculo` WRITE;
/*!40000 ALTER TABLE `vehiculo` DISABLE KEYS */;
INSERT INTO `vehiculo` VALUES (1,'AB444BI','Fiat','Mobi',2019,5,'SUV',33600,1,1,1),(2,'AC753CF','Honda','Fit',2019,5,'SUV',26500,2,1,1),(3,'AF972DO','Toyota','Hilux',2018,5,'Apto discapacitados',12800,3,2,1),(4,'AB490AM','Chevrolet','Cruze',2018,5,'Apto discapacitados',19500,4,1,1),(5,'AG558BH','Renault','Kangoo',2016,5,'Chico',18800,5,3,1),(6,'AB833BD','Honda','Fit',2016,5,'Van',28000,6,3,1),(7,'AD783VH','Toyota','Hilux',2016,5,'Deportivo',34100,4,1,1),(8,'AB807GM','Honda','HR-V',2015,5,'Mediano',22700,7,1,1),(9,'AE313SH','Honda','Civic',2017,5,'Apto discapacitados',11000,8,2,1),(10,'AA905FR','Honda','Fit',2017,5,'Apto discapacitados',16000,3,2,1),(11,'AF687AB','Peugeot','2008',2017,5,'Apto discapacitados',15000,9,3,1),(12,'AG755FV','Ford','Ka',2020,5,'Chico',39700,8,2,1),(13,'AB315SI','Fiat','Cronos',2016,5,'Deportivo',21500,10,2,1),(14,'AD347GV','Honda','Civic',2023,5,'SUV',29100,5,2,1),(15,'AD461DR','Honda','Civic',2015,5,'Chico',23200,11,1,1),(16,'AF128RB','Ford','EcoSport',2018,5,'Apto discapacitados',31600,12,1,1),(17,'AA866NM','Honda','HR-V',2015,5,'Deportivo',15700,9,2,1),(18,'AF542KX','Fiat','Fiorino',2019,2,'Mediano',14800,13,1,1),(19,'AD558KF','Peugeot','Partner',2019,5,'Apto discapacitados',12100,12,1,1),(20,'AD212DG','Volkswagen','Virtus',2016,5,'Apto discapacitados',11400,8,1,1),(21,'AG964QF','Volkswagen','Virtus',2021,5,'Apto discapacitados',14500,14,3,1),(22,'AE480DV','Renault','Duster',2021,5,'Chico',29200,4,1,1),(23,'AB258VP','Ford','Ka',2015,5,'SUV',33100,10,3,1),(24,'AB271JJ','Volkswagen','Amarok',2018,5,'Van',33100,15,3,1),(25,'AE479PJ','Toyota','Corolla',2016,5,'Chico',17100,6,1,1),(26,'AC914WH','Chevrolet','Tracker',2022,5,'Chico',21900,16,2,1),(27,'AG694PM','Peugeot','Partner',2018,5,'Mediano',10400,17,3,1),(28,'AC935IE','Volkswagen','Amarok',2018,5,'Chico',39900,2,2,1),(29,'AF941IE','Toyota','Hilux',2016,5,'Chico',38000,1,2,1),(30,'AE653CK','Peugeot','Partner',2016,5,'Apto discapacitados',25200,13,2,1),(31,'AB898XM','Toyota','Hilux',2016,5,'Deportivo',27800,18,3,1),(32,'AA169YM','Ford','EcoSport',2019,5,'Chico',31400,7,1,1),(33,'AB828SN','Volkswagen','Amarok',2018,5,'Chico',27800,14,3,1),(34,'AF185FA','Peugeot','308',2017,5,'Apto discapacitados',33300,15,3,1),(35,'AF754EV','Volkswagen','T-Cross',2018,5,'SUV',25200,2,1,1),(36,'AA400RQ','Renault','Kwid',2021,5,'Mediano',22400,13,3,1),(37,'AE761WP','Ford','Ka',2021,5,'Van',23400,12,1,1),(38,'AE683IK','Volkswagen','Amarok',2021,5,'SUV',30500,13,2,1),(39,'AF717MZ','Ford','Ranger',2022,5,'Apto discapacitados',28800,2,2,1),(40,'AF501GH','Honda','Civic',2023,5,'Van',15700,1,2,1),(41,'AE821PJ','Chevrolet','Tracker',2022,5,'Mediano',16600,15,2,1),(42,'AB576XX','Toyota','Hilux',2022,5,'Mediano',30800,14,3,1),(43,'AE853IP','Honda','Civic',2016,5,'Apto discapacitados',26000,5,3,1),(44,'AC596HC','Peugeot','Partner',2019,5,'Van',28100,10,2,1),(45,'AA305ZK','Chevrolet','Spin',2022,7,'Van',13700,3,2,1),(46,'AD441KX','Chevrolet','Cruze',2015,5,'Mediano',39700,19,3,1),(47,'AE482EQ','Fiat','Cronos',2021,5,'Deportivo',31800,3,1,1),(48,'AE369NM','Ford','EcoSport',2017,5,'SUV',33900,6,1,1),(49,'AC663SU','Peugeot','308',2015,5,'Apto discapacitados',35200,8,3,1),(50,'AE729RV','Honda','HR-V',2018,5,'Deportivo',21600,2,3,1),(51,'AD570UL','Toyota','Etios',2017,5,'Chico',10700,4,3,1),(52,'AG392TF','Peugeot','208',2022,5,'SUV',35300,19,1,1),(53,'AC496LJ','Peugeot','308',2021,5,'Van',23900,6,3,1),(54,'AG966IY','Ford','Focus',2021,5,'Mediano',35200,2,2,1),(55,'AD430TO','Toyota','Etios',2021,5,'SUV',21100,18,1,1),(56,'AC638WD','Volkswagen','T-Cross',2022,5,'Deportivo',24700,15,3,1),(57,'AE698GA','Honda','HR-V',2021,5,'Mediano',27300,11,1,1),(58,'AF194AV','Volkswagen','Amarok',2021,5,'SUV',21200,1,3,1),(59,'AD282HI','Honda','Civic',2022,5,'Chico',34500,8,3,1),(60,'AD381KQ','Renault','Kangoo',2021,5,'SUV',18600,12,3,1),(61,'AC245NA','Volkswagen','Amarok',2018,5,'SUV',34200,4,3,1),(62,'AF646WE','Renault','Sandero',2017,5,'Apto discapacitados',35300,11,1,1),(63,'AC733UD','Fiat','Fiorino',2020,2,'Chico',21100,13,3,1),(64,'AE547YJ','Honda','Fit',2021,5,'Mediano',24600,14,3,1),(65,'AA631ZO','Peugeot','208',2019,5,'Chico',14600,4,1,1),(66,'AA101QJ','Volkswagen','Gol',2023,5,'Van',37800,6,2,1),(67,'AF770TZ','Toyota','Corolla',2022,5,'SUV',16700,5,3,1),(68,'AE410NA','Honda','HR-V',2018,5,'Deportivo',33000,13,1,1),(69,'AE619HG','Renault','Kwid',2015,5,'Van',28200,16,2,1),(70,'AE734BS','Volkswagen','T-Cross',2015,5,'Mediano',30400,8,2,1),(71,'AB585PL','Volkswagen','Amarok',2022,5,'Van',25800,8,1,1),(72,'AD547YS','Fiat','Mobi',2023,5,'Apto discapacitados',20500,17,1,1),(73,'AD266XK','Ford','Focus',2017,5,'Apto discapacitados',10800,6,1,1),(74,'AA863YU','Peugeot','Partner',2015,5,'SUV',38600,10,1,1),(75,'AD611RZ','Toyota','Etios',2016,5,'Apto discapacitados',18900,18,3,1),(76,'AB953UA','Toyota','Hilux',2023,5,'Chico',22400,16,1,1),(77,'AB529QN','Ford','Focus',2019,5,'Mediano',33300,15,2,1),(78,'AD256DV','Peugeot','2008',2022,5,'SUV',38100,14,1,1),(79,'AB982SX','Honda','Civic',2017,5,'Van',14000,5,1,1),(80,'AC147RP','Peugeot','208',2015,5,'Apto discapacitados',20800,15,2,1),(81,'AC309XK','Chevrolet','Onix',2015,5,'Chico',11600,7,2,1),(82,'AG186BT','Fiat','Fiorino',2018,2,'Van',26600,12,1,1),(83,'AB538JO','Fiat','Fiorino',2015,2,'Mediano',36300,5,2,1),(84,'AD663XQ','Fiat','Cronos',2020,5,'Apto discapacitados',19800,18,1,1),(85,'AD654UF','Renault','Sandero',2019,5,'Van',15000,3,2,1),(86,'AG648EX','Chevrolet','Cruze',2018,5,'Van',18200,20,2,1),(87,'AF867NH','Toyota','Corolla',2019,5,'Van',10200,16,2,1),(88,'AD813UH','Toyota','Corolla',2015,5,'Deportivo',17900,5,2,1),(89,'AF978OE','Ford','Ranger',2016,5,'Mediano',26900,19,3,1),(90,'AF637OO','Ford','Focus',2018,5,'Mediano',14700,7,1,1),(91,'AB922NQ','Ford','EcoSport',2023,5,'Apto discapacitados',21700,18,3,1),(92,'AB846WC','Fiat','Fiorino',2019,2,'Mediano',29700,9,3,1),(93,'AD619WJ','Volkswagen','T-Cross',2021,5,'Van',13500,19,3,1),(94,'AD449XS','Peugeot','208',2019,5,'SUV',19700,4,1,1),(95,'AG125SQ','Chevrolet','Spin',2021,7,'Chico',17400,5,3,1),(96,'AF741PA','Chevrolet','Tracker',2019,5,'Deportivo',13600,7,1,1),(97,'AB840OW','Renault','Sandero',2020,5,'Chico',36800,9,2,1),(98,'AD114SE','Fiat','Toro',2016,5,'Van',23500,7,1,1),(99,'AE479OS','Renault','Kwid',2017,5,'Mediano',29600,6,3,1),(100,'AE747RQ','Ford','Ka',2015,5,'Van',15000,1,2,1),(101,'AD812ZX','Renault','Sandero',2017,5,'Deportivo',24000,17,3,1),(102,'AA173UX','Toyota','Etios',2016,5,'Mediano',29000,16,3,1),(103,'AF285CW','Fiat','Fiorino',2018,2,'Mediano',16200,8,2,1),(104,'AA756PQ','Toyota','Hilux',2018,5,'Apto discapacitados',31900,1,2,1),(105,'AD884JO','Volkswagen','Amarok',2017,5,'SUV',37100,14,2,1),(106,'AC419CZ','Peugeot','308',2018,5,'Van',39600,15,2,1),(107,'AB346EK','Peugeot','2008',2017,5,'Deportivo',13800,11,2,1),(108,'AC246NB','Ford','EcoSport',2015,5,'Mediano',25000,20,2,1),(109,'AA525BP','Fiat','Fiorino',2019,2,'Mediano',17300,19,2,1),(110,'AD170GK','Honda','Civic',2016,5,'Mediano',24300,2,1,1),(111,'AG260SM','Ford','EcoSport',2022,5,'Mediano',28900,8,2,1),(112,'AB204LY','Ford','EcoSport',2015,5,'SUV',10800,4,2,1),(113,'AG639CJ','Volkswagen','Virtus',2018,5,'Mediano',34200,18,3,1),(114,'AF341DX','Honda','HR-V',2023,5,'Van',35900,13,1,1),(115,'AA900BN','Chevrolet','Onix',2023,5,'Apto discapacitados',29200,3,3,1),(116,'AE123CT','Chevrolet','Cruze',2020,5,'SUV',19300,5,2,1),(117,'AD994LT','Fiat','Fiorino',2020,2,'Mediano',21000,18,2,1),(118,'AF788VA','Toyota','Corolla',2023,5,'Deportivo',23900,16,3,1),(119,'AA439IM','Renault','Kwid',2021,5,'Chico',38200,12,1,1),(120,'AC949MS','Toyota','Etios',2017,5,'SUV',18600,5,2,1),(121,'AE568ZI','Honda','HR-V',2018,5,'Chico',28100,15,1,1),(122,'AA960CA','Chevrolet','Spin',2023,7,'Apto discapacitados',29100,3,2,1),(123,'AD948MN','Chevrolet','Spin',2018,7,'Mediano',28700,14,2,1),(124,'AG345OT','Peugeot','Partner',2020,5,'SUV',12000,14,3,1),(125,'AC778DU','Fiat','Toro',2015,5,'Chico',26900,3,3,1),(126,'AE694FM','Fiat','Mobi',2015,5,'Mediano',37800,16,1,1),(127,'AE430DM','Toyota','Etios',2019,5,'Van',24200,14,1,1),(128,'AA835NK','Honda','HR-V',2021,5,'Van',24200,7,2,1),(129,'AA619TF','Fiat','Toro',2015,5,'Chico',21200,20,2,1),(130,'AA117ZY','Fiat','Mobi',2019,5,'Van',22700,14,2,1),(131,'AB757ZT','Peugeot','308',2018,5,'Mediano',28100,20,1,1),(132,'AE686SD','Ford','Ranger',2019,5,'SUV',16100,2,2,1),(133,'AE368OB','Volkswagen','T-Cross',2015,5,'Deportivo',39700,9,3,1),(134,'AB651DS','Peugeot','308',2017,5,'Van',11300,17,2,1),(135,'AD718RG','Fiat','Cronos',2019,5,'Deportivo',15800,11,1,1),(136,'AB178IO','Toyota','Corolla',2016,5,'SUV',14700,7,2,1),(137,'AC376NL','Honda','Civic',2022,5,'SUV',30100,11,2,1),(138,'AF608CB','Peugeot','208',2015,5,'Chico',11900,18,2,1),(139,'AD564UV','Chevrolet','Tracker',2017,5,'Deportivo',16400,15,1,1),(140,'AA509HE','Ford','Ranger',2015,5,'SUV',15000,8,3,1),(141,'AG787TA','Renault','Duster',2020,5,'SUV',34500,6,3,1),(142,'AD745CL','Honda','Fit',2022,5,'Van',33800,10,1,1),(143,'AG156PJ','Honda','Fit',2017,5,'Van',35800,13,2,1),(144,'AC585VW','Renault','Sandero',2023,5,'Deportivo',10000,10,3,1),(145,'AF514RZ','Honda','HR-V',2019,5,'Van',24700,9,2,1),(146,'AB879ZF','Ford','Ka',2023,5,'SUV',25300,10,3,1),(147,'AE742OI','Ford','EcoSport',2015,5,'Deportivo',34000,7,1,1),(148,'AE881AL','Volkswagen','Amarok',2023,5,'Apto discapacitados',20100,1,1,1),(149,'AG926EV','Peugeot','208',2021,5,'Chico',21200,2,1,1),(150,'AC226VV','Fiat','Mobi',2018,5,'Deportivo',28600,1,2,1);
/*!40000 ALTER TABLE `vehiculo` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-20 16:02:35