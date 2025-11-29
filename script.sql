CREATE TABLE
    Login
(
    id_login INT AUTO_INCREMENT,
    mail     VARCHAR(50),
    password VARCHAR(250),
    username VARCHAR(50),
    PRIMARY KEY (id_login),
    UNIQUE (mail),
    UNIQUE (username)
);

CREATE TABLE
    VGDiscover
(
    id_vg        INT AUTO_INCREMENT,
    name         VARCHAR(50) NOT NULL,
    image_link   VARCHAR(255),
    release_date DATE,
    description  VARCHAR(1024),
    PRIMARY KEY (id_vg)
);

CREATE TABLE
    Post
(
    id_post      INT AUTO_INCREMENT,
    title        VARCHAR(50),
    content      VARCHAR(4096) NOT NULL,
    publish_date DATETIME      NOT NULL,
    id_login     INT           NOT NULL,
    PRIMARY KEY (id_post),
    FOREIGN KEY (id_login) REFERENCES Login (id_login) ON DELETE CASCADE
);

CREATE TABLE Reply
(
    id_post       INT,
    id_post_reply INT,
    PRIMARY KEY (id_post, id_post_reply),
    FOREIGN KEY (id_post) REFERENCES Post (id_post) ON DELETE CASCADE,
    FOREIGN KEY (id_post_reply) REFERENCES Post (id_post) ON DELETE CASCADE
);


CREATE TABLE
    Role
(
    id_role INT AUTO_INCREMENT,
    quick   VARCHAR(50) UNIQUE,
    PRIMARY KEY (id_role)
);

CREATE TABLE
    Talk_about
(
    id_vg   INT,
    id_post INT,
    PRIMARY KEY (id_vg, id_post),
    FOREIGN KEY (id_vg) REFERENCES VGDiscover (id_vg) ON DELETE CASCADE,
    FOREIGN KEY (id_post) REFERENCES Post (id_post) ON DELETE CASCADE
);

CREATE TABLE
    HAS_A
(
    id_login INT,
    id_role  INT,
    PRIMARY KEY (id_login, id_role),
    FOREIGN KEY (id_login) REFERENCES Login (id_login) ON DELETE CASCADE,
    FOREIGN KEY (id_role) REFERENCES Role (id_role) ON DELETE CASCADE
);

CREATE TABLE
    Play
(
    id_login INT,
    id_post  INT,
    PRIMARY KEY (id_login, id_post),
    FOREIGN KEY (id_login) REFERENCES Login (id_login),
    FOREIGN KEY (id_post) REFERENCES Post (id_post) ON DELETE CASCADE
);

CREATE TABLE
    `Signal`
(
    id_login INT,
    id_post  INT,
    PRIMARY KEY (id_login, id_post),
    FOREIGN KEY (id_login) REFERENCES Login (id_login),
    FOREIGN KEY (id_post) REFERENCES Post (id_post) ON DELETE CASCADE
);

CREATE TABLE QSet
(
    id_set         INT AUTO_INCREMENT,
    prompt         VARCHAR(50) NOT NULL,
    ressource_link VARCHAR(50),
    ressource_type VARCHAR(50),
    id_post        INT         NOT NULL,
    PRIMARY KEY (id_set),
    FOREIGN KEY (id_post) REFERENCES Post (id_post) ON DELETE CASCADE
);

CREATE TABLE Question
(
    id_set      INT,
    id_question INT,
    is_correct  INT         NOT NULL,
    statement   VARCHAR(50) NOT NULL,
    PRIMARY KEY (id_set, id_question),
    FOREIGN KEY (id_set) REFERENCES QSet (id_set) ON DELETE CASCADE
);

CREATE TABLE Session
(
    id_post     INT,
    id_set      INT,
    id_question INT,
    id_login    INT,
    id_session  INT,
    id_score    INT,
    start_date  DATETIME,
    PRIMARY KEY (id_post, id_set, id_question, id_login, id_session),
    FOREIGN KEY (id_post) REFERENCES Post (id_post) ON DELETE CASCADE,
    FOREIGN KEY (id_set, id_question) REFERENCES Question (id_set, id_question) ON DELETE CASCADE,
    FOREIGN KEY (id_login) REFERENCES Login (id_login) ON DELETE CASCADE
);


INSERT INTO Role (id_role, quick)
VALUES (1, 'sysadmin'),
       (2, 'manager');

INSERT INTO `Login`
VALUES (1, 'courriel@example.com', '$2b$10$a3kOLslV3lHnjWiN08hvtOWraIRR5PNa6TAtU5MUEXiAH8fG5ftDq', 'myusername'),
       (2, 'mail@example.com', '$2b$10$Ykfa8ryKLThCxMHNvDlJp.anFzVf7dMgtmwfP30tVg8VNV3EAZvWu', 'altusername');

INSERT INTO `VGDiscover`
VALUES (2, 'Mario', 'https://cdn.example.com/image.jpg', '2017-07-21', 'A amazing description of a videogame'),
       (3, 'Zelda', 'https://cdn.example.com/image.jpg', '2021-07-21', 'A amazing description of a videogame'),
       (4, 'Minecraft', 'https://cdn.example.com/image.jpg', '2017-07-21', 'A amazing description of a videogame');

INSERT INTO `Post`
VALUES (1, 'Hello World !', 'My name is Nico.', '2025-11-13 13:37:26', 1),
       (2, 'My friends are gone', 'My name is Pierre.', '2025-11-13 13:37:55', 1),
       (3, NULL, 'My surname is Nico.', '2025-11-13 13:38:31', 1),
       (4, 'Altusername post', 'My name is Pierre.', '2025-11-13 13:41:41', 2),
       (7, 'VG out', 'VGD NOw out !', '2025-11-18 14:17:52', 1);

INSERT INTO `QSet`
VALUES (1, 'What is the correct answer ?', 'https://cdn.example.com/image.jpg', 'image', 1),
       (2, 'What is the correct answer ?', 'https://cdn.example.com/image.jpg', 'image', 2),
       (3, 'What is the correct answer ?', 'https://cdn.example.com/image.jpg', 'image', 4),
       (4, 'What is the correct answer ?', 'https://cdn.example.com/image.jpg', 'image', 7);

INSERT INTO `Question`
VALUES (1, 1, 1, 'A example of an affirmation.'),
       (2, 1, 1, 'A example of an affirmation.'),
       (3, 1, 1, 'A example of an affirmation.'),
       (4, 1, 1, 'A example of an affirmation.');


INSERT INTO `Play`
VALUES (1, 1),
       (2, 1);

INSERT INTO `HAS_A`
VALUES (1, 1),
       (1, 2);

INSERT INTO `Reply`
VALUES (1, 3);

INSERT INTO `Signal`
VALUES (1, 1),
       (2, 1);

INSERT INTO `Talk_about`
VALUES (2, 1),
       (3, 1),
       (2, 2),
       (2, 4),
       (2, 7);
