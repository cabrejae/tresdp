-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 20-04-2025 a las 06:12:19
-- Versión del servidor: 10.11.11-MariaDB-ubu2404
-- Versión de PHP: 8.3.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `httpswwwtresdpcomar`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tresdp_parametros`
--

CREATE TABLE `tresdp_parametros` (
  `id` int(11) NOT NULL,
  `sDescripcion` varchar(100) NOT NULL,
  `nValor` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `tresdp_parametros`
--

INSERT INTO `tresdp_parametros` (`id`, `sDescripcion`, `nValor`) VALUES
(1, 'Dolar', 1300.00),
(2, 'IndiceML1', 1.80),
(3, 'IndiceML2', 2.30);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tresdp_pending_orders`
--

CREATE TABLE `tresdp_pending_orders` (
  `id` int(11) NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `variation_id` bigint(20) UNSIGNED DEFAULT NULL,
  `order_number` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `order_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `tresdp_pending_orders`
--

INSERT INTO `tresdp_pending_orders` (`id`, `product_id`, `variation_id`, `order_number`, `quantity`, `order_date`) VALUES
(7, 287, NULL, '8200076771138464', 2, '2025-04-05'),
(8, 1185, NULL, '8200076771138464', 2, '2025-04-05'),
(11, 1241, NULL, '8197407797238464', 10, '2025-04-07'),
(20, 1126, 1128, '8197874465318464', 5, '2025-04-07'),
(21, 1126, 1129, '8197874465318464', 15, '2025-04-07'),
(22, 1126, 1130, '8197874465318464', 15, '2025-04-07'),
(23, 1126, 1131, '8197874465318464', 15, '2025-04-07'),
(24, 228, NULL, '8197985244118464', 7, '2025-04-07'),
(25, 1317, NULL, '8198664150508464', 2, '2025-04-07'),
(26, 220, NULL, '8198602210958464', 5, '2025-04-07'),
(27, 1319, 1333, '8198261207628464', 1, '2025-04-07'),
(28, 1319, 1335, '8198261207628464', 1, '2025-04-07'),
(29, 1355, 1356, '8198261207628464', 1, '2025-04-07'),
(30, 1251, NULL, '8198259928958464', 2, '2025-04-07'),
(33, 1321, NULL, '8199145327808464', 3, '2025-04-07'),
(34, 1318, 1337, '8199411954498464', 5, '2025-04-07'),
(35, 1318, 1338, '8199411954498464', 5, '2025-04-07'),
(36, 1318, 1339, '8199411954498464', 5, '2025-04-07'),
(37, 1318, 1340, '8199411954498464', 5, '2025-04-07'),
(38, 234, 678, '8199316909478464', 5, '2025-04-07'),
(39, 1116, 1117, '8199316909478464', 15, '2025-04-07'),
(40, 1116, 1118, '8199316909478464', 15, '2025-04-07'),
(41, 1116, 1119, '8199316909478464', 15, '2025-04-07'),
(42, 1116, 1120, '8199316909478464', 15, '2025-04-07'),
(43, 1116, 1121, '8199316909478464', 15, '2025-04-07'),
(44, 1116, 1117, '8200190553658464', 10, '2025-04-07'),
(45, 1234, NULL, '8200190553658464', 18, '2025-04-07'),
(46, 234, 239, '8200190553658464', 15, '2025-04-07'),
(47, 234, 242, '8200190553658464', 15, '2025-04-07'),
(48, 1026, NULL, '8199780922638464', 3, '2025-04-07'),
(49, 297, NULL, '8199780922638464', 33, '2025-04-07'),
(50, 1318, 1340, '8199780922638464', 4, '2025-04-07'),
(51, 297, NULL, '8199363061048464', 9, '2025-04-07'),
(52, 1318, 1340, '8199363061048464', 5, '2025-04-07'),
(53, 345, NULL, '8199363061048464', 5, '2025-04-07'),
(54, 1318, 1338, '8199363061048464', 5, '2025-04-07'),
(58, 234, 678, '8199638734928464', 25, '2025-04-12'),
(59, 203, NULL, '8199638734928464', 30, '2025-04-12'),
(60, 203, NULL, '8199638734928464', 30, '2025-04-14'),
(61, 234, 678, '8199638734928464', 25, '2025-04-14'),
(62, 234, 241, '8199638734928464', 25, '2025-04-14'),
(63, 1038, 1410, '8199638734968464', 20, '2025-04-14');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tresdp_precio_productos`
--

CREATE TABLE `tresdp_precio_productos` (
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `variation_id` bigint(20) UNSIGNED NOT NULL,
  `cantidad` int(11) NOT NULL,
  `unidades` int(11) NOT NULL,
  `envio` decimal(10,2) NOT NULL,
  `pedio` decimal(10,2) NOT NULL,
  `costo_aduana` decimal(10,2) NOT NULL,
  `fecha` date NOT NULL DEFAULT curdate()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `tresdp_parametros`
--
ALTER TABLE `tresdp_parametros`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `tresdp_pending_orders`
--
ALTER TABLE `tresdp_pending_orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `variation_id` (`variation_id`);

--
-- Indices de la tabla `tresdp_precio_productos`
--
ALTER TABLE `tresdp_precio_productos`
  ADD PRIMARY KEY (`product_id`,`variation_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `tresdp_parametros`
--
ALTER TABLE `tresdp_parametros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `tresdp_pending_orders`
--
ALTER TABLE `tresdp_pending_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `tresdp_pending_orders`
--
ALTER TABLE `tresdp_pending_orders`
  ADD CONSTRAINT `tresdp_pending_orders_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `wpot_posts` (`ID`),
  ADD CONSTRAINT `tresdp_pending_orders_ibfk_2` FOREIGN KEY (`variation_id`) REFERENCES `wpot_posts` (`ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
