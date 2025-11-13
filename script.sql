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
    id_post   INT,
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
    FOREIGN KEY (id_post) REFERENCES Post (id_post)
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
    id_set        INT AUTO_INCREMENT,
    prompt        VARCHAR(50) NOT NULL,
    ressource_link VARCHAR(50),
    ressource_type VARCHAR(50),
    id_post INT NOT NULL,
    PRIMARY KEY (id_set),
    FOREIGN KEY(id_post) REFERENCES Post(id_post) ON DELETE CASCADE
);

CREATE TABLE Question
(
    id_set         INT,
    id_question    INT,
    is_correct     INT NOT NULL,
    statement      VARCHAR(50) NOT NULL,
    PRIMARY KEY (id_set, id_question),
    FOREIGN KEY (id_set) REFERENCES QSet (id_set) ON DELETE CASCADE
);

INSERT INTO Role (id_role, quick)
VALUES (1, 'adminsys'),
       (2, 'manager');

#INSERT INTO Login (id_login, mail, password, username)
#VALUES (1, 'root@example.com', 'root', 'root'),
#       (2, 'for@example.com', 'meta', 'meta')